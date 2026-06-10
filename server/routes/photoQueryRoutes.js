// server/routes/photoQueryRoutes.js
const express = require('express');
const router = express.Router();
const Photo = require('../models/Photo');
const Works = require('../models/Works');
const { REGION_CODE_TO_NAME, COUNTRY_CN_TO_CODE, COUNTRY_CODE_TO_CN } = require('./constants');

// ==========================================
// 📋 获取草稿箱列表
// ==========================================
router.get('/drafts', async (req, res) => {
  try {
    const drafts = await Photo.find({ isDraft: true }).sort({ createdAt: -1 })
    res.json({ success: true, data: drafts })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
})

// ==========================================
// 🗺️ 足迹地图数据接口（按地区聚合照片）
// ==========================================
router.get('/footprints', async (req, res) => {
  try {
    const results = await Photo.aggregate([
      { $match: {} },
      {
        $group: {
          _id: { region: '$region', locationName: '$locationName' },
          photoCount: { $sum: 1 },
          allAlbumIds: { $push: '$albumIds' },
          allPhotos: { $push: { src: '$imageUrl', alt: '$fileName' } }
        }
      },
      {
        $project: {
          photoCount: 1,
          albumIds: {
            $setDifference: [
              { $reduce: {
                input: '$allAlbumIds',
                initialValue: [],
                in: { $setUnion: ['$$value', '$$this'] }
              }},
              [null]
            ]
          },
          photos: { $slice: ['$allPhotos', 6] }
        }
      },
      { $sort: { photoCount: -1 } }
    ]);

    // 查出所有地点类作品集 ID（有 locationCode 的）
    const locationWorks = await Works.find({ locationCode: { $exists: true, $ne: '' } }, { _id: 1 }).lean();
    const locationWorkIds = new Set(locationWorks.map(w => w._id.toString()));

    const data = results.map(item => {
      const region = item._id.region || '';
      const locationName = item._id.locationName || '未标记地点';
      const isChineseProvince = region.startsWith('CN-');

      // 只统计地点类作品集，过滤掉手动创建的
      const locationAlbumCount = item.albumIds.filter(id => id && id !== 'none' && locationWorkIds.has(id)).length;

      return {
        region,
        locationName,
        photoCount: item.photoCount,
        albumCount: locationAlbumCount || 1,
        photos: item.photos || [],
        mapCode: isChineseProvince ? region : (COUNTRY_CN_TO_CODE[locationName] || ''),
      };
    });

    res.json({ success: true, data });
  } catch (error) {
    console.error('足迹聚合查询失败:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==========================================
// 🖼️ 画廊详情：按地区获取全部照片
// ==========================================
router.get('/gallery/:mapCode', async (req, res) => {
  try {
    const { mapCode } = req.params;
    const isProvince = mapCode.startsWith('CN-');

    let query, title;
    if (isProvince) {
      query = { region: mapCode };
      title = REGION_CODE_TO_NAME[mapCode] || mapCode;
    } else {
      const cnName = COUNTRY_CODE_TO_CN[mapCode];
      if (!cnName) return res.status(400).json({ success: false, message: '未知地区代码' });
      query = { locationName: cnName };
      title = cnName;
    }

    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 20));
    const skip = (page - 1) * limit;

    const [photos, total] = await Promise.all([
      Photo.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Photo.countDocuments(query),
    ]);

    res.json({
      success: true,
      data: {
        title,
        mapCode,
        total,
        page,
        limit,
        hasMore: skip + photos.length < total,
        photos: photos.map(p => ({
          id: p._id,
          src: p.imageUrl,
          alt: p.fileName || p.originalName || '',
          exif: p.exif,
          title: p.title,
          caption: p.caption,
          createdAt: p.createdAt,
        })),
      }
    });
  } catch (error) {
    console.error('画廊详情查询失败:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==========================================
// 📷 获取单张照片详情（含 EXIF）
// ==========================================
router.get('/:id', async (req, res) => {
  try {
    const photo = await Photo.findById(req.params.id)
    if (!photo) return res.status(404).json({ success: false, message: '照片不存在' })
    res.json({ success: true, data: photo })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
})

module.exports = router;
