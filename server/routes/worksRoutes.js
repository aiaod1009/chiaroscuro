// server/routes/worksRoutes.js
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Works = require('../models/Works');
const Photo = require('../models/Photo');

// 查找作品集下的第一张照片（同时匹配字符串和 ObjectId）
const findFirstPhoto = async (workId) => {
  const workIdStr = workId.toString();
  // 先按字符串匹配
  let photo = await Photo.findOne({ albumIds: workIdStr }).sort({ createdAt: 1 }).lean();
  if (!photo) {
    // 再按 ObjectId 匹配（防止 albumIds 存的是 ObjectId 而非字符串）
    try {
      const oid = new mongoose.Types.ObjectId(workIdStr);
      photo = await Photo.findOne({ albumIds: oid }).sort({ createdAt: 1 }).lean();
    } catch { }
  }
  return photo;
};

// ==========================================
// 📚 获取全部作品集（按真实时间倒序）
// ==========================================
router.get('/', async (req, res) => {
  try {
    const portfolios = await Works.find().sort({ realDate: -1 }).lean();

    // 补全封面：优先使用自定义封面，否则取第一张照片
    await Promise.all(portfolios.map(async (work) => {
      if (!work.coverImage) {
        const first = await findFirstPhoto(work._id)
        work.coverImage = first?.imageUrl || ''
      }
    }))

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

    const workIdStr = portfolio._id.toString();
    // 同时匹配字符串和 ObjectId
    const oid = mongoose.Types.ObjectId.isValid(workIdStr) ? new mongoose.Types.ObjectId(workIdStr) : null;
    const query = oid
      ? { albumIds: { $in: [workIdStr, oid] } }
      : { albumIds: workIdStr };
    const photos = await Photo.find(query).sort({ createdAt: -1 });

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
// 🗑️ 删除作品集(未使用）
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
