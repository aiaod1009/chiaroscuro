// server/routes/photoRoutes.js
const express = require('express');
const router = express.Router();
const ExifParser = require('exif-parser');
const { cos } = require('../config/cos');
const { upload } = require('../config/cos'); // 引入安检闸机
const Photo = require('../models/Photo');

// ==========================================
// 📸 接口 1：上传微单原图（占坑 + 抠参数）
// ==========================================
// server/routes/photoRoutes.js 的第一个原图接口

// server/routes/photoRoutes.js 的第一个原图接口

router.post('/upload-raw', upload.single('photo'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: '没收到原图' });

    // 提前把我们需要的数据从 req.file 里抠出来固化，防止后台线程找不到变量
    const fileBuffer = req.file.buffer;
    const originalName = req.file.originalname;

    // 1. ⚡ 毫秒级剥离 EXIF 元数据
    let exifData = {};
    try {
      const parser = ExifParser.create(fileBuffer);
      exifData = parser.parse().tags;
    } catch (e) {
      console.log('EXIF 解析失败');
    }
    const shutterSpeed = exifData.ExposureTime ? (exifData.ExposureTime < 1 ? `1/${Math.round(1 / exifData.ExposureTime)}s` : `${exifData.ExposureTime}s`) : '未知';

    // 2. ⚡ 提前算好云端门牌号
    const filename = `raw-${Date.now()}-${originalName}`;
    const finalImageUrl = `https://${process.env.COS_BUCKET}.cos.${process.env.COS_REGION}.myqcloud.com/gallery/${filename}`;

    // 3. ⚡ 数据直接落地 MongoDB
    const rawPhoto = await Photo.create({
      originalName,
      imageUrl: finalImageUrl,
      status: 'raw',
      versionName: '原始RAW基底',
      cameraModel: exifData.Model || '未知型号',
      shutterSpeed,
      fNumber: exifData.FNumber || null,
      focalLength: exifData.FocalLength ? `${exifData.FocalLength}mm` : '未知',
      iso: exifData.ISO || null,
    });

    // 4. 🔥 【核心救命大招】把腾讯云上传强行丢进“平行宇宙”，彻底不占用当前的 HTTP 响应管道
    setImmediate(() => {
      console.log('🛰️  [后台线程激活] 开启独立网络通道投递 6.6MB 照片...');
      cos.putObject({
        Bucket: process.env.COS_BUCKET,
        Region: process.env.COS_REGION,
        Key: `gallery/${filename}`,
        Body: fileBuffer
      }, (err, data) => {
        if (err) console.error('❌ [后台传输失败]:', err.message);
        else console.log('🍃 [后台传输成功] 照片已安全抵达腾讯云广州桶！');
      });
    });

    // 5. 🚀 斩断执念！因为管道已经干净了，这一行会以 0.05 秒的速度瞬间秒回前端！
    return res.status(200).json({
      success: true,
      message: '📸 拍照元数据已秒级捕获，图片正在后台同步云端...',
      data: rawPhoto
    });

  } catch (error) {
    if (!res.headersSent) {
      return res.status(500).json({ success: false, message: error.message });
    }
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
      parentId: parentPhoto._id, // 刻上妈妈的胎记，连上线了！
      versionName: versionName || '未命名调色版',

      // ✨ 华丽的灵魂继承：直接从母体记录里把参数抄过来
      cameraModel: parentPhoto.cameraModel,
      shutterSpeed: parentPhoto.shutterSpeed,
      fNumber: parentPhoto.fNumber,
      focalLength: parentPhoto.focalLength,
      iso: parentPhoto.iso,
    });

    res.status(200).json({ success: true, message: `成片【${versionName}】发布成功，已与原图绑定纽带！`, data: masterPhoto });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
});

module.exports = router;