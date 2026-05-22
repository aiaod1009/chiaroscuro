// server/models/Photo.js
const mongoose = require('mongoose');

const PhotoSchema = new mongoose.Schema({
  // 1. 文件关联核心
  albumId: { type: String, default: 'none' },       // 所属相册
  originalName: { type: String },                    // 原始文件名，兼容旧数据
  fileName: { type: String },                        // 前端传来的文件名，如 photo.webp
  imageUrl: { type: String, required: true },        // 图片公网访问路径
  status: { type: String, enum: ['raw', 'master'], default: 'raw' },
  isDraft: { type: Boolean, default: false },        // 草稿标记，前台瀑布流不显示

  // 多版本对比的核心纽带
  parentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Photo', default: null },
  versionName: { type: String, default: '原图' },

  // 2. EXIF 子文档（前端 canvas 解析后传入）
  exif: {
    camera: { type: String, default: 'Unknown Camera' },
    lens: { type: String, default: 'Unknown Lens' },
    aperture: { type: String, default: 'f/0.0' },      // 如 f/2.8
    iso: { type: String, default: '0' },
    shutterSpeed: { type: String, default: '0s' },      // 如 1/500s
    focalLength: { type: String, default: '0mm' },      // 如 32.5mm
    dateTimeOriginal: { type: Date }
  },

  // 3. 地图足迹
  region: { type: String, default: '' },
  locationName: { type: String, default: '未标记地点' },
  coordinates: {
    lat: { type: Number },
    lng: { type: Number }
  },

  // 4. 内容叙事层
  title: { type: String, default: '' },
  caption: { type: String, default: '' },
  aiAnalysis: { type: String, default: '' },

  createdAt: { type: Date, default: Date.now }
});

// 导出这个模型，让 photoRoutes.js 路由里可以通过 Photo.create() 去写入它
module.exports = mongoose.model('Photo', PhotoSchema);