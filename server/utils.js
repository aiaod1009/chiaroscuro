// server/routes/utils.js
const { cos } = require('../config/cos');

// ==========================================
// 🚨 统一错误响应
// ==========================================
const sendError = (res, status, message) => {
  res.status(status).json({ success: false, message });
};

// ==========================================
// 📦 COS 操作封装
// ==========================================
const uploadToCOS = (key, buffer) => {
  return new Promise((resolve, reject) => {
    cos.putObject({
      Bucket: process.env.COS_BUCKET,
      Region: process.env.COS_REGION,
      Key: key,
      Body: buffer,
    }, (err, data) => err ? reject(err) : resolve(data));
  });
};

const deleteFromCOS = (key) => {
  return new Promise((resolve, reject) => {
    cos.deleteObject({
      Bucket: process.env.COS_BUCKET,
      Region: process.env.COS_REGION,
      Key: key,
    }, (err, data) => err ? reject(err) : resolve(data));
  });
};

// ==========================================
// 📄 分页参数解析
// ==========================================
const parsePagination = (query, defaultLimit = 20, maxLimit = 50) => {
  const page = Math.max(1, parseInt(query.page) || 1);
  const limit = Math.min(maxLimit, Math.max(1, parseInt(query.limit) || defaultLimit));
  const skip = (page - 1) * limit;
  return { page, limit, skip };
};

module.exports = { sendError, uploadToCOS, deleteFromCOS, parsePagination };
