// server/routes/aiRoutes.js
const express = require('express');
const router = express.Router();
const Photo = require('../models/Photo');

// =======================================================
// 📝 AI 独立路由：照片标题与文艺配文灵感生成器（官方标准直连版）
// =======================================================
router.post('/inspiration', async (req, res) => {
  try {
    const { photoId } = req.body;
    if (!photoId) {
      return res.status(400).json({ success: false, message: '请传入照片ID(photoId)' });
    }

    // 1. 去数据库把这张照片的腾讯云 URL 捞出来
    const photo = await Photo.findById(photoId);
    if (!photo) {
      return res.status(404).json({ success: false, message: '找不到该照片记录' });
    }

    console.log(`🛰️  [官方直连网关] 正在用 4.6V-Flash 品评照片: ${photo.originalName}`);

    // 2. 严格对齐你 Cherry 成功以及官方 curl 的数据结构
    const requestBody = {
      model: "glm-4.6v-flash", // 稳稳消耗你那 600 万 Tokens 的新手大礼包
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "请仔细分析这张图片的内容、色彩和画面意境。你现在是摄影画册的文案编辑，请为这张照片提供灵感：1. 构思一个符合画面意境的、简短有质感的图片标题（4-8个字）；2. 撰写一段与图片内容强相关、现代且克制的文艺配文（两句话以内，40字以内）。请务必以严谨的 JSON 格式直接返回，不要带任何 Markdown 标记或解释。格式必须为：{ \"title\": \"图片标题\", \"caption\": \"文艺配文\" }"
            },
            {
              type: "image_url",
              image_url: { url: photo.imageUrl } // 喂给 AI 腾讯云公网原图
            }
          ]
        }
      ],
      response_format: { type: "json_object" } // 强制大模型输出 JSON 对象
    };

    // 3. 🚀 降维打击：直接用原生 fetch 轰炸官方标准的 completions 终点站
    // 核心：直接把你在智谱后台拿到的明文 API Key 塞进 Authorization 里面
    const response = await fetch('https://open.bigmodel.cn/api/paas/v4/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer c91cff7c61e7413d863e80e0489de3bf.yIIP9XFEc6fN1TPn'
      },
      body: JSON.stringify(requestBody)
    });

    // 4. 安全防御检查
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`智谱中枢拒签，状态码: ${response.status}, 原因: ${errorText}`);
    }

    const resData = await response.json();

    // 5. 提取并解析大模型写好的 JSON 灵感数据
    const resultJson = JSON.parse(resData.choices[0].message.content.trim());

    // 6. 各归各位：安全同步存入你打好的数据库地基中
    photo.userNotes = resultJson.title;  // 写入标题坑
    photo.aiDiary = resultJson.caption;  // 写入文案坑
    await photo.save();

    // 7. 优雅回传前端，大获全胜！
    return res.status(200).json({
      success: true,
      message: '✨ 灵感生成并全自动落盘成功！',
      data: {
        title: resultJson.title,
        caption: resultJson.caption
      }
    });

  } catch (error) {
    console.error('❌【AI 灵感网关最终异常】:', error.message);
    return res.status(500).json({ success: false, message: `AI网络异常: ${error.message}` });
  }
});

module.exports = router;