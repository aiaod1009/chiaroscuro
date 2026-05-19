const mongoose = require('mongoose');

const AISessionSchema = new mongoose.Schema({
  photoId: { type: mongoose.Schema.Types.ObjectId, ref: 'Photo', required: true },
  chosenStyle: { type: String, required: true }, // 用户选定的风格，如 '活泼', '正式', '冷酷'

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
// 数据库中只允许存在一条对应的 AISession 记录
AISessionSchema.index({ photoId: 1, chosenStyle: 1 }, { unique: true });

module.exports = mongoose.model('AISession', AISessionSchema);