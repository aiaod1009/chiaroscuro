// server/routes/photoRoutes.js
const express = require('express');
const router = express.Router();
const { cos } = require('../config/cos');
const { upload } = require('../config/cos');
const Photo = require('../models/Photo');
const Works = require('../models/Works');

const REGION_CODE_TO_NAME = {
  'CN-11': '北京', 'CN-12': '天津', 'CN-13': '河北', 'CN-14': '山西',
  'CN-15': '内蒙古', 'CN-21': '辽宁', 'CN-22': '吉林', 'CN-23': '黑龙江',
  'CN-31': '上海', 'CN-32': '江苏', 'CN-33': '浙江', 'CN-34': '安徽',
  'CN-35': '福建', 'CN-36': '江西', 'CN-37': '山东', 'CN-41': '河南',
  'CN-42': '湖北', 'CN-43': '湖南', 'CN-44': '广东', 'CN-45': '广西',
  'CN-46': '海南', 'CN-50': '重庆', 'CN-51': '四川', 'CN-52': '贵州',
  'CN-53': '云南', 'CN-54': '西藏', 'CN-61': '陕西', 'CN-62': '甘肃',
  'CN-63': '青海', 'CN-64': '宁夏', 'CN-65': '新疆', 'CN-HK': '香港',
  'CN-MO': '澳门', 'CN-TW': '台湾'
};

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

// 由 COUNTRY_CN_TO_CODE 自动生成反向映射
const COUNTRY_CODE_TO_CN = Object.fromEntries(
  Object.entries(COUNTRY_CN_TO_CODE).map(([cn, code]) => [code, cn])
);

// 根据地点自动查找或创建作品集
const findOrCreateWorks = async (region, locationName) => {
  // 省份：用 region（CN-11）匹配
  if (region && region.startsWith('CN-')) {
    let works = await Works.findOne({ locationCode: region });
    if (!works) {
      const name = REGION_CODE_TO_NAME[region] || region;
      works = await Works.create({ name, locationCode: region, locationName: name, realDate: new Date() });
    }
    return works._id;
  }

  // 国家：用国家中文名匹配 locationCode
  const code = COUNTRY_CN_TO_CODE[locationName];
  if (code) {
    let works = await Works.findOne({ locationCode: code });
    if (!works) {
      works = await Works.create({ name: locationName, locationCode: code, locationName, realDate: new Date() });
    }
    return works._id;
  }

  return null;
};

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
      { $match: {} },
      {
        $group: {
          _id: { region: '$region', locationName: '$locationName' },
          photoCount: { $sum: 1 },
          allAlbumIds: { $push: '$albumIds' },
          allPhotos: { $push: { src: '$imageUrl', alt: '$fileName' } }
        }
      },
      {
        $project: {
          photoCount: 1,
          albumIds: {
            $setDifference: [
              { $reduce: {
                input: '$allAlbumIds',
                initialValue: [],
                in: { $setUnion: ['$$value', '$$this'] }
              }},
              [null]
            ]
          },
          photos: { $slice: ['$allPhotos', 6] }
        }
      },
      { $sort: { photoCount: -1 } }
    ]);

    // 查出所有地点类作品集 ID（有 locationCode 的）
    const locationWorks = await Works.find({ locationCode: { $exists: true, $ne: '' } }, { _id: 1 }).lean();
    const locationWorkIds = new Set(locationWorks.map(w => w._id.toString()));

    const data = results.map(item => {
      const region = item._id.region || '';
      const locationName = item._id.locationName || '未标记地点';
      const isChineseProvince = region.startsWith('CN-');

      // 只统计地点类作品集，过滤掉手动创建的
      const locationAlbumCount = item.albumIds.filter(id => id && id !== 'none' && locationWorkIds.has(id)).length;

      return {
        region,
        locationName,
        photoCount: item.photoCount,
        albumCount: locationAlbumCount || 1,
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
// 🖼️ 画廊详情：按地区获取全部照片
// ==========================================
router.get('/gallery/:mapCode', async (req, res) => {
  try {
    const { mapCode } = req.params;
    const isProvince = mapCode.startsWith('CN-');

    let query, title;
    if (isProvince) {
      query = { region: mapCode };
      title = REGION_CODE_TO_NAME[mapCode] || mapCode;
    } else {
      const cnName = COUNTRY_CODE_TO_CN[mapCode];
      if (!cnName) return res.status(400).json({ success: false, message: '未知地区代码' });
      query = { locationName: cnName };
      title = cnName;
    }

    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 20));
    const skip = (page - 1) * limit;

    const [photos, total] = await Promise.all([
      Photo.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Photo.countDocuments(query),
    ]);

    res.json({
      success: true,
      data: {
        title,
        mapCode,
        total,
        page,
        limit,
        hasMore: skip + photos.length < total,
        photos: photos.map(p => ({
          id: p._id,
          src: p.imageUrl,
          alt: p.fileName || p.originalName || '',
          exif: p.exif,
          title: p.title,
          caption: p.caption,
          createdAt: p.createdAt,
        })),
      }
    });
  } catch (error) {
    console.error('画廊详情查询失败:', error);
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
// 🚫 从指定作品集移除照片（不删除照片本身）
// ==========================================
router.patch('/:id/remove-album', async (req, res) => {
  try {
    const { albumId } = req.body
    if (!albumId) return res.status(400).json({ success: false, message: '作品集 ID 必填' })

    const photo = await Photo.findById(req.params.id)
    if (!photo) return res.status(404).json({ success: false, message: '照片不存在' })

    const albumIdStr = albumId.toString()

    // 从 albumIds 中移除
    photo.albumIds = photo.albumIds.filter(id => id.toString() !== albumIdStr)
    await photo.save()

    res.json({ success: true, data: photo })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
})

// ==========================================
// 📦 移动照片到其他作品集
// ==========================================
router.patch('/:id/move', async (req, res) => {
  try {
    const { targetAlbumId } = req.body
    if (!targetAlbumId) return res.status(400).json({ success: false, message: '目标作品集 ID 必填' })
    const photo = await Photo.findByIdAndUpdate(
      req.params.id,
      { $set: { albumIds: [targetAlbumId] } },
      { new: true }
    )
    if (!photo) return res.status(404).json({ success: false, message: '照片不存在' })
    res.json({ success: true, data: photo })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
})

// ==========================================
// 📋 复制照片到其他作品集（追加 albumId）
// ==========================================
router.patch('/:id/copy', async (req, res) => {
  try {
    const { targetAlbumId } = req.body
    if (!targetAlbumId) return res.status(400).json({ success: false, message: '目标作品集 ID 必填' })
    const photo = await Photo.findByIdAndUpdate(
      req.params.id,
      { $addToSet: { albumIds: targetAlbumId } },
      { new: true }
    )
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
// 🗑️ 删除照片
// ==========================================
router.delete('/:id', async (req, res) => {
  try {
    const photo = await Photo.findByIdAndDelete(req.params.id)
    if (!photo) return res.status(404).json({ success: false, message: '照片不存在' })

    // 同步删除腾讯云 COS 上的文件
    if (photo.imageUrl) {
      try {
        const url = new URL(photo.imageUrl)
        const key = url.pathname.substring(1)
        await new Promise((resolve, reject) => {
          cos.deleteObject({
            Bucket: process.env.COS_BUCKET,
            Region: process.env.COS_REGION,
            Key: key,
          }, (err, data) => err ? reject(err) : resolve(data))
        })
      } catch (cosErr) {
        console.error('COS 文件删除失败（数据库已删）:', cosErr.message)
      }
    }

    res.json({ success: true, message: '照片已删除' })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
})

// ==========================================
// 📸 接口 1：上传 WebP 草稿（前端 canvas 转换 + 解析 EXIF）
// ==========================================
router.post('/upload-raw', async (req, res) => {
  try {
    const { imageUrl, fileName, locationName, region, exif, selectedAlbumId } = req.body;

    if (!imageUrl) return res.status(400).json({ success: false, message: '没收到图片链接' });

    // albumIds：仅用户手动选择的作品集
    const albumIds = [];
    if (selectedAlbumId) albumIds.push(selectedAlbumId);

    const newPhotoDraft = new Photo({
      albumIds,
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

    // 自动封面：给没有封面的作品集设置第一张上传图
    if (albumIds.length > 0) {
      await Works.updateMany(
        { _id: { $in: albumIds }, $or: [{ coverImage: '' }, { coverImage: { $exists: false } }] },
        { $set: { coverImage: imageUrl } }
      );
    }

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