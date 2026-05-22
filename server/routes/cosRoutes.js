const express = require('express');
const router = express.Router();
const tencentcloud = require('tencentcloud-sdk-nodejs-sts');

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
    const allowPrefix = 'gallery/*';

    const policy = {
      version: '2.0',
      statement: [
        {
          action: ['name/cos:PutObject'],
          effect: 'allow',
          resource: [
            `qcs::cos:${region}:uid/${bucket}:prefix///${bucket}/${allowPrefix}`,
          ],
        },
      ],
    };

    const data = await stsClient.AssumeRole({
      RoleArn: process.env.STS_ROLE_ARN,
      RoleSessionName: `chiaroscuro-${Date.now()}`,
      Policy: JSON.stringify(policy),
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
    res.status(500).json({ success: false, message: 'STS 签发失败', error: error.message });
  }
});

module.exports = router;
