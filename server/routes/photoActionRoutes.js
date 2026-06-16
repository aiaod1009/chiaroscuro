// server/routes/photoActionRoutes.js
const express = require('express');
const router = express.Router();
const Photo = require('../models/Photo');
const { sendError, deleteFromCOS } = require('../utils');

// ==========================================
// 🚫 从指定作品集移除照片（不删除照片本身）
// ==========================================
router.patch('/:id/remove-album', async (req, res) => {
  try {
    const { albumId } = req.body
    if (!albumId) return sendError(res, 400, '作品集 ID 必填');

    const photo = await Photo.findById(req.params.id)
    if (!photo) return sendError(res, 404, '照片不存在');

    const albumIdStr = albumId.toString()

    // 从 albumIds 中移除
    photo.albumIds = photo.albumIds.filter(id => id.toString() !== albumIdStr)
    await photo.save()

    res.json({ success: true, data: photo })
  } catch (error) {
    sendError(res, 500, error.message);
  }
})

// ==========================================
// 📦 移动照片到其他作品集
// ==========================================
router.patch('/:id/move', async (req, res) => {
  try {
    const { targetAlbumId } = req.body
    if (!targetAlbumId) return sendError(res, 400, '目标作品集 ID 必填');
    const photo = await Photo.findByIdAndUpdate(
      req.params.id,
      { $set: { albumIds: [targetAlbumId] } },
      { new: true }
    )
    if (!photo) return sendError(res, 404, '照片不存在');
    res.json({ success: true, data: photo })
  } catch (error) {
    sendError(res, 500, error.message);
  }
})

// ==========================================
// 📋 复制照片到其他作品集（追加 albumId）
// ==========================================
router.patch('/:id/copy', async (req, res) => {
  try {
    const { targetAlbumId } = req.body
    if (!targetAlbumId) return sendError(res, 400, '目标作品集 ID 必填');
    const photo = await Photo.findByIdAndUpdate(
      req.params.id,
      { $addToSet: { albumIds: targetAlbumId } },
      { new: true }
    )
    if (!photo) return sendError(res, 404, '照片不存在');
    res.json({ success: true, data: photo })
  } catch (error) {
    sendError(res, 500, error.message);
  }
})

// ==========================================
// ✏️ 更新照片标题、配文、版本名
// ==========================================
router.patch('/:id', async (req, res) => {
  try {
    const { title, caption, versionName } = req.body
    const update = {}
    if (title !== undefined) update.title = title
    if (caption !== undefined) update.caption = caption
    if (versionName !== undefined) update.versionName = versionName
    const photo = await Photo.findByIdAndUpdate(
      req.params.id,
      { $set: update },
      { new: true }
    )
    if (!photo) return sendError(res, 404, '照片不存在');
    res.json({ success: true, data: photo })
  } catch (error) {
    sendError(res, 500, error.message);
  }
})

// ==========================================
// ⭐ 设为展示版（取消传 null）
// ==========================================
router.patch('/:id/display-version', async (req, res) => {
  try {
    const { versionId } = req.body
    const photo = await Photo.findById(req.params.id)
    if (!photo) return sendError(res, 404, '照片不存在');

    if (!versionId) {
      // 取消展示版，恢复用原图
      photo.displayVersionId = null
      photo.displayImageUrl = ''
    } else {
      const version = await Photo.findById(versionId)
      if (!version) return sendError(res, 404, '版本不存在');
      photo.displayVersionId = versionId
      photo.displayImageUrl = version.imageUrl
    }

    await photo.save()
    res.json({ success: true, data: photo })
  } catch (error) {
    sendError(res, 500, error.message);
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
    if (!photo) return sendError(res, 404, '照片不存在');
    res.json({ success: true, data: photo })
  } catch (error) {
    sendError(res, 500, error.message);
  }
})

// ==========================================
// 🗑️ 删除照片
// ==========================================
router.delete('/:id', async (req, res) => {
  try {
    const photo = await Photo.findByIdAndDelete(req.params.id)
    if (!photo) return sendError(res, 404, '照片不存在');

    // 同步删除腾讯云 COS 上的文件
    if (photo.imageUrl) {
      try {
        const url = new URL(photo.imageUrl);
        const key = url.pathname.substring(1);
        await deleteFromCOS(key);
      } catch (cosErr) {
        console.error('COS 文件删除失败（数据库已删）:', cosErr.message);
      }
    }

    res.json({ success: true, message: '照片已删除' })
  } catch (error) {
    sendError(res, 500, error.message);
  }
})

module.exports = router;
