// server/models/Works.js
const mongoose = require('mongoose');

const WorksSchema = new mongoose.Schema({
  name: { type: String, required: true },                  // 作品集名称
  description: { type: String, default: '' },              // 描述
  realDate: { type: Date },                                // 真实拍摄时间（时间轴排序依据）
  coverImage: { type: String, default: '' },               // 封面图 URL
  locationCode: { type: String, default: '' },             // 地区代码（CN-11 / JP 等，用于自动匹配）
  locationName: { type: String, default: '' },             // 地点名称
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Works', WorksSchema);
