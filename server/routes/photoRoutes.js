// server/routes/photoRoutes.js
const express = require('express');
const router = express.Router();
const { cos } = require('../config/cos');
const { upload } = require('../config/cos');
const Photo = require('../models/Photo');

// ==========================================
// 📋 获取草稿箱列表
// ==========================================
router.get('/drafts', async (req, res) => {
  try {
    const drafts = await Photo.find({ isDraft: true }).sort({ createdAt: -1 })
    res.json({ success: true, data: drafts })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
})

// ==========================================
// 🗺️ 足迹地图数据接口（按地区聚合照片）
// ==========================================
router.get('/footprints', async (req, res) => {
  try {
    const results = await Photo.aggregate([
      { $match: { isDraft: false } },
      {
        $group: {
          _id: { region: '$region', locationName: '$locationName' },
          photoCount: { $sum: 1 },
          albumIds: { $addToSet: '$albumId' },
          allPhotos: { $push: { src: '$imageUrl', alt: '$fileName' } }
        }
      },
      {
        $project: {
          photoCount: 1,
          albumIds: 1,
          photos: { $slice: ['$allPhotos', 6] }
        }
      },
      { $sort: { photoCount: -1 } }
    ]);

    const COUNTRY_CN_TO_CODE = {
      '中国': 'CN', '日本': 'JP', '韩国': 'KR', '新加坡': 'SG',
      '泰国': 'TH', '越南': 'VN', '马来西亚': 'MY', '印度尼西亚': 'ID',
      '菲律宾': 'PH', '印度': 'IN', '美国': 'US', '加拿大': 'CA',
      '墨西哥': 'MX', '巴西': 'BR', '阿根廷': 'AR', '智利': 'CL',
      '英国': 'GB', '法国': 'FR', '德国': 'DE', '意大利': 'IT',
      '西班牙': 'ES', '葡萄牙': 'PT', '荷兰': 'NL', '比利时': 'BE',
      '瑞士': 'CH', '奥地利': 'AT', '挪威': 'NO', '瑞典': 'SE',
      '芬兰': 'FI', '冰岛': 'IS', '丹麦': 'DK', '俄罗斯': 'RU',
      '澳大利亚': 'AU', '新西兰': 'NZ'
    };

    const data = results.map(item => {
      const region = item._id.region || '';
      const locationName = item._id.locationName || '未标记地点';
      const isChineseProvince = region.startsWith('CN-');

      return {
        region,
        locationName,
        photoCount: item.photoCount,
        albumCount: item.albumIds.filter(id => id && id !== 'none').length || 1,
        photos: item.photos || [],
        mapCode: isChineseProvince ? region : (COUNTRY_CN_TO_CODE[locationName] || ''),
      };
    });

    res.json({ success: true, data });
  } catch (error) {
    console.error('足迹聚合查询失败:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==========================================
// 📷 获取单张照片详情（含 EXIF）
// ==========================================
router.get('/:id', async (req, res) => {
  try {
    const photo = await Photo.findById(req.params.id)
    if (!photo) return res.status(404).json({ success: false, message: '照片不存在' })
    res.json({ success: true, data: photo })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
})

// ==========================================
// ✏️ 更新照片标题与配文
// ==========================================
router.patch('/:id', async (req, res) => {
  try {
    const { title, caption } = req.body
    const photo = await Photo.findByIdAndUpdate(
      req.params.id,
      { $set: { title, caption } },
      { new: true }
    )
    if (!photo) return res.status(404).json({ success: false, message: '照片不存在' })
    res.json({ success: true, data: photo })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
})

// ==========================================
// 📸 接口 1：上传 WebP 草稿（前端 canvas 转换 + 解析 EXIF）
// ==========================================
router.post('/upload-raw', async (req, res) => {
  try {
    const { albumId, imageUrl, fileName, locationName, region, exif } = req.body;

    if (!imageUrl) return res.status(400).json({ success: false, message: '没收到图片链接' });

    const newPhotoDraft = new Photo({
      albumId: albumId || 'none',
      imageUrl,
      fileName: fileName || 'UNTITLED.webp',
      isDraft: true,
      locationName: locationName || '未标记地点',
      region: region || '',
      exif: {
        camera: exif?.camera || 'Unknown Camera',
        lens: exif?.lens || 'Unknown Lens',
        aperture: exif?.aperture || 'f/0.0',
        iso: exif?.iso || '0',
        shutterSpeed: exif?.shutterSpeed || '0s',
        focalLength: exif?.focalLength || '0mm',
        dateTimeOriginal: exif?.dateTimeOriginal || null,
      },
    });

    await newPhotoDraft.save();

    res.json({
      success: true,
      message: 'WebP 资产与 EXIF 刻录成功，已放入草稿箱！',
      data: newPhotoDraft
    });
  } catch (error) {
    console.error('上传落盘异常:', error);
    res.status(500).json({ success: false, message: '服务器入库失败' });
  }
});
// ==========================================
// 🎨 接口 2：上传成片（支持无限衍生、多版本并存）
// ==========================================
// 前端请求时，FormData 里除了放 'photo' 文件，还要顺便带上 parentId 和 versionName
router.post('/upload-master', upload.single('photo'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: '没收到成片文件' });

    // 从前端的表单字段里拿到母体 ID 和这次调色的版本名字
    const { parentId, versionName } = req.body;
    if (!parentId) return res.status(400).json({ success: false, message: '必须指定原图母体的 parentId 才能进行对比绑定！' });

    // 顺藤摸瓜，先看看妈妈在不在
    const parentPhoto = await Photo.findById(parentId);
    if (!parentPhoto) return res.status(404).json({ success: false, message: '找不到指定的原图母体' });

    // 把成片踹上腾讯云
    const originalName = req.file.originalname;
    const filename = `master-${Date.now()}-${originalName}`;
    await new Promise((resolve, reject) => {
      cos.putObject({ Bucket: process.env.COS_BUCKET, Region: process.env.COS_REGION, Key: `gallery/${filename}`, Body: req.file.buffer }, (err, data) => { if (err) reject(err); else resolve(data); });
    });
    const finalImageUrl = `https://${process.env.COS_BUCKET}.cos.${process.env.COS_REGION}.myqcloud.com/gallery/${filename}`;

    // 落地为子体记录：肉身是新的调色图，灵魂直接复制妈妈的 EXIF 参数！
    const masterPhoto = await Photo.create({
      originalName,
      imageUrl: finalImageUrl,
      status: 'master',
      parentId: parentPhoto._id,
      versionName: versionName || '未命名调色版',
      exif: { ...parentPhoto.exif?.toObject?.() || parentPhoto.exif },
    });

    res.status(200).json({ success: true, message: `成片【${versionName}】发布成功，已与原图绑定纽带！`, data: masterPhoto });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
});

module.exports = router;