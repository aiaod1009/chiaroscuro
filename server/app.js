// server/app.js
require('dotenv').config();  //读.env 文件里的环境变量
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');  // 解决跨域问题
const photoRoutes = require('./routes/photoRoutes');
const aiRoutes = require('./routes/aiRoutes');
const cosRoutes = require('./routes/cosRoutes');
const worksRoutes = require('./routes/worksRoutes');

const app = express();

// 中间件
app.use(cors());
app.use(express.json());

// 核心连接本地 MongoDB（如果发现没有 chiaroscuro 库，它会自动建库！）
const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/chiaroscuro';
mongoose.connect(mongoUri)
  .then(() => console.log('🍃 1. MongoDB 数据库已全自动就位！'))
  .catch(err => console.error('❌ 数据库连接失败:', err.message));

// 挂载我们的照片光影传输路由
app.use('/api/photos', photoRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/cos', cosRoutes);
app.use('/api/works', worksRoutes);

app.get('/', (req, res) => {
  res.send('chiaroscuro 后端大本营运行中...');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 2. 服务端已在 http://localhost:${PORT} 倾听光影...`);
});