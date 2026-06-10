// server/routes/photoRoutes.js
const express = require('express');
const router = express.Router();

// 挂载子路由
router.use('/', require('./photoQueryRoutes'));
router.use('/', require('./photoActionRoutes'));
router.use('/', require('./photoUploadRoutes'));

module.exports = router;
