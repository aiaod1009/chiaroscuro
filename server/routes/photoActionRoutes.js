// server/routes/photoActionRoutes.js
const express = require('express');
const router = express.Router();
const { cos } = require('../config/cos');
const Photo = require('../models/Photo');

// ==========================================
// 🚫 从指定作品集移除照片（不删除照片本身）
// ==========================================
router.patch('/:id/remove-album', async (req, res) => {
  try {
    const { albumId } = req.body
    if (!albumId) return res.status(400).json({ success: false, message: '作品集 ID 必填' })

    const photo = await Photo.findById(req.params.id)
    if (!photo) return res.status(404).json({ success: false, message: '照片不存在' })

    const albumIdStr = albumId.toString()

    // 从 albumIds 中移除
    photo.albumIds = photo.albumIds.filter(id => id.toString() !== albumIdStr)
    await photo.save()

    res.json({ success: true, data: photo })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
})

// ==========================================
// 📦 移动照片到其他作品集
// ==========================================
router.patch('/:id/move', async (req, res) => {
  try {
    const { targetAlbumId } = req.body
    if (!targetAlbumId) return res.status(400).json({ success: false, message: '目标作品集 ID 必填' })
    const photo = await Photo.findByIdAndUpdate(
      req.params.id,
      { $set: { albumIds: [targetAlbumId] } },
      { new: true }
    )
    if (!photo) return res.status(404).json({ success: false, message: '照片不存在' })
    res.json({ success: true, data: photo })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
})

// ==========================================
// 📋 复制照片到其他作品集（追加 albumId）
// ==========================================
router.patch('/:id/copy', async (req, res) => {
  try {
    const { targetAlbumId } = req.body
    if (!targetAlbumId) return res.status(400).json({ success: false, message: '目标作品集 ID 必填' })
    const photo = await Photo.findByIdAndUpdate(
      req.params.id,
      { $addToSet: { albumIds: targetAlbumId } },
      { new: true }
    )
    if (!photo) return res.status(404).json({ success: false, message: '照片不存在' })
    res.json({ success: true, data: photo })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
})

// ==========================================
// ✏️ 更新照片标题与配文
// ==========================================
router.patch('/:id', async (req, res) => {
  try {
    const { title, caption } = req.body
    const photo = await Photo.findByIdAndUpdate(
      req.params.id,
      { $set: { title, caption } },
      { new: true }
    )
    if (!photo) return res.status(404).json({ success: false, message: '照片不存在' })
    res.json({ success: true, data: photo })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
})

// ==========================================
// 🎨 缓存色彩分析结果
// ==========================================
router.patch('/:id/colors', async (req, res) => {
  try {
    const { colors } = req.body
    const photo = await Photo.findByIdAndUpdate(
      req.params.id,
      { $set: { colors } },
      { new: true }
    )
    if (!photo) return res.status(404).json({ success: false, message: '照片不存在' })
    res.json({ success: true, data: photo })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
})

// ==========================================
// 🗑️ 删除照片
// ==========================================
router.delete('/:id', async (req, res) => {
  try {
    const photo = await Photo.findByIdAndDelete(req.params.id)
    if (!photo) return res.status(404).json({ success: false, message: '照片不存在' })

    // 同步删除腾讯云 COS 上的文件
    if (photo.imageUrl) {
      try {
        const url = new URL(photo.imageUrl)
        const key = url.pathname.substring(1)
        await new Promise((resolve, reject) => {
          cos.deleteObject({
            Bucket: process.env.COS_BUCKET,
            Region: process.env.COS_REGION,
            Key: key,
          }, (err, data) => err ? reject(err) : resolve(data))
        })
      } catch (cosErr) {
        console.error('COS 文件删除失败（数据库已删）:', cosErr.message)
      }
    }

    res.json({ success: true, message: '照片已删除' })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
})

module.exports = router;
