// server/routes/photoUploadRoutes.js
const express = require('express');
const router = express.Router();
const { upload } = require('../config/cos');
const Photo = require('../models/Photo');
const Works = require('../models/Works');
const { sendError, uploadToCOS } = require('../utils');

// ==========================================
// 📸 接口 1：上传 WebP 草稿（前端 canvas 转换 + 解析 EXIF）
// ==========================================
router.post('/upload-raw', async (req, res) => {
  try {
    const { imageUrl, fileName, locationName, region, exif, selectedAlbumId } = req.body;

    if (!imageUrl) return sendError(res, 400, '没收到图片链接');

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

    // 自动封面：异步执行，不阻塞响应
    if (albumIds.length > 0) {
      Works.updateMany(
        { _id: { $in: albumIds }, $or: [{ coverImage: '' }, { coverImage: { $exists: false } }] },
        { $set: { coverImage: imageUrl } }
      ).catch(err => console.error('封面更新失败:', err));
    }

    res.json({
      success: true,
      message: 'WebP 资产与 EXIF 刻录成功，已放入草稿箱！',
      data: newPhotoDraft
    });
  } catch (error) {
    console.error('上传落盘异常:', error);
    sendError(res, 500, '服务器入库失败');
  }
});

// ==========================================
// 🎨 接口 2：上传成片（支持无限衍生、多版本并存）
// ==========================================
router.post('/upload-master', upload.single('photo'), async (req, res) => {
  try {
    if (!req.file) return sendError(res, 400, '没收到成片文件');

    const { parentId, versionName } = req.body;
    if (!parentId) return sendError(res, 400, '必须指定原图母体的 parentId 才能进行对比绑定！');

    const parentPhoto = await Photo.findById(parentId);
    if (!parentPhoto) return sendError(res, 404, '找不到指定的原图母体');

    // 把成片上传到腾讯云
    const originalName = req.file.originalname;
    const filename = `master-${Date.now()}-${originalName}`;
    await uploadToCOS(`gallery/${filename}`, req.file.buffer);
    const finalImageUrl = `https://${process.env.COS_BUCKET}.cos.${process.env.COS_REGION}.myqcloud.com/gallery/${filename}`;

    // 落地为子体记录
    const masterPhoto = await Photo.create({
      originalName,
      imageUrl: finalImageUrl,
      status: 'master',
      parentId: parentPhoto._id,
      versionName: versionName || '未命名调色版',
      exif: { ...parentPhoto.exif?.toObject?.() || parentPhoto.exif },
    });

    res.status(200).json({ success: true, message: `成片【${versionName}】发布成功，已与原图绑定纽带！`, data: masterPhoto });
  } catch (error) { sendError(res, 500, error.message); }
});

module.exports = router;
