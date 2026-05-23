const mongoose = require('mongoose');

const AISessionSchema = new mongoose.Schema({
  photoId: { type: mongoose.Schema.Types.ObjectId, ref: 'Photo', default: null },
  imageUrl: { type: String, default: '' }, // 当 photoId 为空时，用 imageUrl 做关联
  chosenStyle: { type: String, required: true }, // 用户选定的风格，如 '诗意', '叙事', '极简'

  // 记录该风格下的多轮图文对话历史
  messages: [{
    role: { type: String, enum: ['user', 'assistant'], required: true },
    content: mongoose.Schema.Types.Mixed
  }],

  // 存放该风格下的 3 个不同备选方案选项
  candidates: [{
    optionId: { type: Number, required: true }, // 1, 2, 3 号方案
    title: String,
    caption: String
  }],

  createdAt: { type: Date, default: Date.now }
});

// 联合唯一索引，确保一张照片的每种风格在全天下有且仅有一个专属抽屉
// 当 photoId 存在时按 photoId 索引，否则按 imageUrl 索引
AISessionSchema.index({ photoId: 1, chosenStyle: 1 }, { unique: true, partialFilterExpression: { photoId: { $exists: true } } });
AISessionSchema.index({ imageUrl: 1, chosenStyle: 1 }, { unique: true, partialFilterExpression: { photoId: null } });

module.exports = mongoose.model('AISession', AISessionSchema);