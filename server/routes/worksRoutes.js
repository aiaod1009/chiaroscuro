// server/routes/worksRoutes.js
const express = require('express');
const router = express.Router();
const Works = require('../models/Works');
const Photo = require('../models/Photo');

// ==========================================
// 📚 获取全部作品集（按真实时间倒序）
// ==========================================
router.get('/', async (req, res) => {
  try {
    const portfolios = await Works.find().sort({ realDate: -1 }).lean();

    // 为没有封面的作品集自动补全：取该作品集下第一张照片作为封面
    const needCover = portfolios.filter(p => !p.coverImage);
    if (needCover.length > 0) {
      await Promise.all(needCover.map(async (work) => {
        const firstPhoto = await Photo.findOne({ albumIds: work._id.toString() }).sort({ createdAt: 1 }).lean();
        if (firstPhoto) {
          work.coverImage = firstPhoto.imageUrl;
          // 持久化到数据库，下次不再查
          await Works.updateOne({ _id: work._id }, { $set: { coverImage: firstPhoto.imageUrl } });
        }
      }));
    }

    res.json({ success: true, data: portfolios });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==========================================
// 🗺️ 获取旅游相册列表（足迹地图用）
// ==========================================
router.get('/travel', async (req, res) => {
  try {
    const travels = await Works.find({ isTravel: true }).sort({ realDate: -1 });
    res.json({ success: true, data: travels });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==========================================
// 📖 获取单个作品集详情 + 关联照片
// ==========================================
router.get('/:id', async (req, res) => {
  try {
    const portfolio = await Works.findById(req.params.id);
    if (!portfolio) return res.status(404).json({ success: false, message: '作品集不存在' });

    const photos = await Photo.find({ albumIds: portfolio._id.toString() }).sort({ createdAt: -1 });

    res.json({ success: true, data: { ...portfolio.toObject(), photos } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==========================================
// ➕ 创建作品集
// ==========================================
router.post('/', async (req, res) => {
  try {
    const { name, description, realDate, coverImage } = req.body;
    if (!name) return res.status(400).json({ success: false, message: '名称为必填项' });

    const portfolio = await Works.create({ name, description, realDate, coverImage });
    res.json({ success: true, data: portfolio });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==========================================
// ✏️ 更新作品集
// ==========================================
router.patch('/:id', async (req, res) => {
  try {
    const portfolio = await Works.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true });
    if (!portfolio) return res.status(404).json({ success: false, message: '作品集不存在' });
    res.json({ success: true, data: portfolio });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==========================================
// 🗑️ 删除作品集
// ==========================================
router.delete('/:id', async (req, res) => {
  try {
    const portfolio = await Works.findByIdAndDelete(req.params.id);
    if (!portfolio) return res.status(404).json({ success: false, message: '作品集不存在' });
    res.json({ success: true, message: '作品集已删除' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
