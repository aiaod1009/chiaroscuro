// server/models/Photo.js
const mongoose = require('mongoose');

const PhotoSchema = new mongoose.Schema({
  // 1. 文件关联核心（用来做后期的成片覆盖）
  originalName: { type: String, required: true }, // 原始文件名，比如 DSC_6760.JPG
  imageUrl: { type: String, required: true },     // 图片在腾讯云 COS 里的公网访问路径
  status: { type: String, enum: ['raw', 'master'], default: 'raw' }, // 状态：原图占坑 / 成片成型

  // 🎯 新增：多版本对比的核心纽带
  // 如果是原图，这里留空；如果是成片，这里死死指向它原图的 MongoDB _id
  parentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Photo', default: null },
  // 给这个版本起个名字，比如 "日落暖调版", "16:9 电影裁剪版"
  versionName: { type: String, default: '原图' },

  // 2. 自动抠出来的硬核硬件参数（EXIF）—— 已完美干掉品牌 Make 字段
  cameraModel: { type: String, default: '未知型号' },// 尼康微单会直接抓出: NIKON Z 30
  shutterSpeed: { type: String },                    // 快门速度，如 1/500s
  fNumber: { type: Number },                         // 光圈大小，如 5
  focalLength: { type: String },                     // 实际焦距，如 32.5mm
  iso: { type: Number },                             // 感光度，如 100
  dateTimeOriginal: { type: Date },                  // 单反记录的拍摄原始时间

  // 3. 地图足迹核心（如果没有自带 GPS，后续前端会让你手动选个城市，后端自动缝合经纬度）
  locationName: { type: String, default: '未标记地点' }, // 比如 "新疆阿勒泰"
  coordinates: {
    lat: { type: Number }, // 纬度
    lng: { type: Number }  // 经度
  },

  // 4. 内容叙事层（留给 AI 和你的碎碎念）
  userNotes: { type: String, default: '' },   // 你自己当时导照片时的碎碎念
  aiDiary: { type: String, default: '' },     // 手动点击后，AI 生成的王家卫风光影日记
  aiAnalysis: { type: String, default: '' },  // 手动点击后，AI 对这张图的构图/修图建议

  createdAt: { type: Date, default: Date.now } // 数据入库时间
});

// 导出这个模型，让 photoRoutes.js 路由里可以通过 Photo.create() 去写入它
module.exports = mongoose.model('Photo', PhotoSchema);