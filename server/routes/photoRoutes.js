const express = require('express');
const router = express.Router();
const ExifParser = require('exif-parser');
const { cos } = require('../config/cos');
const multer = require('multer');
const Photo = require('../models/Photo');

// 临时让 Multer 在内存接住单张上传的照片，前端传过来的字段名叫 'photo'
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.post('/upload', upload.single('photo'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: '没有接收到照片文件' });
    }

    const fileBuffer = req.file.buffer;
    const originalName = req.file.originalname;

    // 1. 核心极客操作：在内存里直接用 exif-parser 抠出尼康 Z30 的快门光圈
    let exifData = {};
    try {
      const parser = ExifParser.create(fileBuffer);
      exifData = parser.parse().tags;
    } catch (e) {
      console.log('该照片无法解析出 EXIF 元数据');
    }

    // 格式化快门速度
    const exposureTime = exifData.ExposureTime;
    const shutterSpeed = exposureTime
      ? (exposureTime < 1 ? `1/${Math.round(1 / exposureTime)}s` : `${exposureTime}s`)
      : '未知';

    // 2. 核心大招：把图片 Buffer 直接一脚踹上腾讯云 COS
    const filename = `${Date.now()}-${originalName}`; // 防止重名，加个时间戳

    // 腾讯云 COS 上传方法
    const cosResult = await new Promise((resolve, reject) => {
      cos.putObject({
        Bucket: process.env.COS_BUCKET,
        Region: process.env.COS_REGION,
        Key: `gallery/${filename}`, // 在云端建一个 gallery 文件夹存放
        Body: fileBuffer,
      }, (err, data) => {
        if (err) reject(err);
        else resolve(data);
      });
    });

    // 🔥 看到没！这里就是全自动获取每张图公网 URL 的地方！
    const finalImageUrl = `https://${process.env.COS_BUCKET}.cos.${process.env.COS_REGION}.myqcloud.com/gallery/${filename}`;

    // 3. 完美织网：把云端吐回来的 URL 和抠出来的尼康参数，一起拍进 MongoDB 数据库
    const newPhoto = await Photo.create({
      originalName: originalName,
      imageUrl: finalImageUrl, // 自动获取的 URL 稳稳落地
      status: 'raw', // 默认是原图占坑状态
      cameraModel: exifData.Model || '未知型号',
      shutterSpeed: shutterSpeed,
      fNumber: exifData.FNumber || null,
      focalLength: exifData.FocalLength ? `${exifData.FocalLength}mm` : '未知',
      iso: exifData.ISO || null,
      dateTimeOriginal: exifData.DateTimeOriginal ? new Date(exifData.DateTimeOriginal * 1000) : null
    });

    // 4. 得意地告诉前端：全线通车！
    res.status(200).json({
      success: true,
      message: '照片成功直通云端并入库数据库！',
      data: newPhoto
    });

  } catch (error) {
    console.error('上传链路崩溃:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;