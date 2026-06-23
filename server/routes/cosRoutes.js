const express = require('express');
const router = express.Router();
const tencentcloud = require('tencentcloud-sdk-nodejs-sts');
const { sendError } = require('../utils');

const StsClient = tencentcloud.sts.v20180813.Client;

const stsClient = new StsClient({
  credential: {
    secretId: process.env.COS_SECRET_ID,
    secretKey: process.env.COS_SECRET_KEY,
  },
  region: process.env.COS_REGION || 'ap-guangzhou',
  profile: {
    httpProfile: {
      endpoint: 'sts.tencentcloudapi.com',
    },
  },
});

// GET /api/cos/sts — 为前端生成直传 COS 的临时凭证
router.get('/sts', async (req, res) => {
  try {
    const bucket = process.env.COS_BUCKET;
    const region = process.env.COS_REGION;

    const data = await stsClient.AssumeRole({
      RoleArn: process.env.STS_ROLE_ARN,
      RoleSessionName: `chiaroscuro-${Date.now()}`,
      DurationSeconds: 1800,
    });

    const creds = data.Credentials;
    res.json({
      success: true,
      tmpSecretId: creds.TmpSecretId,
      tmpSecretKey: creds.TmpSecretKey,
      sessionToken: creds.Token,
      startTime: data.StartTime,
      expiredTime: data.ExpiredTime,
      bucket,
      region,
    });
  } catch (error) {
    console.error('STS 签发失败:', error);
    sendError(res, 500, 'STS 签发失败: ' + (error.message || error));
  }
});

module.exports = router;
