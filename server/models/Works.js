// server/models/Works.js
const mongoose = require('mongoose');

const WorksSchema = new mongoose.Schema({
  name: { type: String, required: true },                  // 作品集名称
  description: { type: String, default: '' },              // 描述
  realDate: { type: Date, required: true },                // 真实拍摄时间（时间轴排序依据）
  coverImage: { type: String, default: '' },               // 封面图 URL
  isTravel: { type: Boolean, default: false },             // 是否旅游相册
  locationName: { type: String, default: '' },             // 旅游地点名
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Works', WorksSchema);
