// server/config/cos.js
require('dotenv').config();
const COS = require('cos-nodejs-sdk-v5');
const multer = require('multer');

// 1. 在 .env 里藏好的钥匙初始化腾讯云 COS 客户端
const cos = new COS({
  SecretId: process.env.COS_SECRET_ID,
  SecretKey: process.env.COS_SECRET_KEY,
});

// 2. 配置 Multer：让它把图片暂时接住并存在内存（Buffer）里，直接解析 EXIF 和上传
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

module.exports = { cos, upload }