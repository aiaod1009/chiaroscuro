// server/routes/aiRoutes.js
const express = require('express');
const router = require('express').Router();
const Photo = require('../models/Photo');

const apiKey = process.env.ZHIPU_AI_KEY;
// =======================================================
// 📝 AI 独立路由：照片标题与文艺配文灵感生成器（腾讯云样式终盘通车版）
// =======================================================
router.post('/inspiration', async (req, res) => {
  try {
    const { photoId } = req.body;
    if (!photoId) return res.status(400).json({ success: false, message: '请传入照片ID' });

    // 1. 去数据库把照片原图链接捞出来
    const photo = await Photo.findById(photoId);
    if (!photo) return res.status(404).json({ success: false, message: '找不到该照片记录' });

    console.log(`🛰️  [云端极速网关] 正在触发腾讯云实时捏图并通知智谱: ${photo.originalName}`);

    // 2. 🎯 核心绝杀：直接在原图链接后面暴力拼接 !small
    // 这样发过去绝对不带问号，大模型不会过滤它，会乖乖带着 !small 找腾讯云拉 50KB 的缩略图！
    const optimizedImageUrl = `${photo.imageUrl}!small`;

    const requestBody = {
      model: "glm-4.6v-flash", // 稳稳报销你的 600 万 Tokens 免费券
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
              image_url: { url: optimizedImageUrl }
            }
          ]
        }
      ],
      response_format: { type: "json_object" }
    };

    // 3. 原生 fetch 冲锋
    const response = await fetch('https://open.bigmodel.cn/api/paas/v4/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`智谱中枢拒签: ${errorText}`);
    }

    const resData = await response.json();
    const resultJson = JSON.parse(resData.choices[0].message.content.trim());

    // 4. 数据全自动同步落盘到你的 userNotes 和 aiDiary 字段
    photo.userNotes = resultJson.title;
    photo.aiDiary = resultJson.caption;
    await photo.save();

    return res.status(200).json({
      success: true,
      message: '✨ 极速灵感生成并自动落盘成功！',
      data: { title: resultJson.title, caption: resultJson.caption }
    });

  } catch (error) {
    console.error('❌【AI 灵感路由异常】:', error.message);
    return res.status(500).json({ success: false, message: `AI网关异常: ${error.message}` });
  }
});

module.exports = router;