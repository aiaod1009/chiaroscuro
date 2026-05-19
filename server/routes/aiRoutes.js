// server/routes/aiRoutes.js
const express = require('express');
const router = require('express').Router();
const Photo = require('../models/Photo');

const apiKey = process.env.ZHIPU_AI_KEY;
// =======================================================
// 📝 AI 独立路由：照片标题与文艺配文灵感生成器（腾讯云样式终盘通车版）
// =======================================================
// router.post('/inspiration', async (req, res) => {
//   try {
//     const { photoId } = req.body;
//     if (!photoId) return res.status(400).json({ success: false, message: '请传入照片ID' });

//     // 1. 去数据库把照片原图链接捞出来
//     const photo = await Photo.findById(photoId);
//     if (!photo) return res.status(404).json({ success: false, message: '找不到该照片记录' });

//     console.log(`🛰️  [云端极速网关] 正在触发腾讯云实时捏图并通知智谱: ${photo.originalName}`);

//     // 2. 🎯 核心绝杀：直接在原图链接后面暴力拼接 !small
//     // 这样发过去绝对不带问号，大模型不会过滤它，会乖乖带着 !small 找腾讯云拉 50KB 的缩略图！
//     const optimizedImageUrl = `${photo.imageUrl}!small`;

//     const requestBody = {
//       model: "glm-4.6v-flash", // 稳稳报销你的 600 万 Tokens 免费券
//       messages: [
//         {
//           role: "user",
//           content: [
//             {
//               type: "text",
//               text: "请仔细分析这张图片的内容、色彩和画面意境。你现在是摄影画册的文案编辑，请为这张照片提供灵感：1. 构思一个符合画面意境的、简短有质感的图片标题（4-8个字）；2. 撰写一段与图片内容强相关、现代且克制的文艺配文（两句话以内，40字以内）。请务必以严谨的 JSON 格式直接返回，不要带任何 Markdown 标记或解释。格式必须为：{ \"title\": \"图片标题\", \"caption\": \"文艺配文\" }"
//             },
//             {
//               type: "image_url",
//               image_url: { url: optimizedImageUrl }
//             }
//           ]
//         }
//       ],
//       response_format: { type: "json_object" }
//     };

//     // 3. 原生 fetch 冲锋
//     const response = await fetch('https://open.bigmodel.cn/api/paas/v4/chat/completions', {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//         'Authorization': `Bearer ${apiKey}`
//       },
//       body: JSON.stringify(requestBody)
//     });

//     if (!response.ok) {
//       const errorText = await response.text();
//       throw new Error(`智谱中枢拒签: ${errorText}`);
//     }

//     const resData = await response.json();
//     const resultJson = JSON.parse(resData.choices[0].message.content.trim());

//     // 4. 数据全自动同步落盘到你的 userNotes 和 aiDiary 字段
//     photo.userNotes = resultJson.title;
//     photo.aiDiary = resultJson.caption;
//     await photo.save();

//     return res.status(200).json({
//       success: true,
//       message: '✨ 极速灵感生成并自动落盘成功！',
//       data: { title: resultJson.title, caption: resultJson.caption }
//     });

//   } catch (error) {
//     console.error('❌【AI 灵感路由异常】:', error.message);
//     return res.status(500).json({ success: false, message: `AI网关异常: ${error.message}` });
//   }
// });
const express = require('express');
const router = express.Router();
const AISession = require('../models/AISession');

// 接口 1：首次触发（根据选定风格生成 3 个备选方案，或直接复用历史记录）
router.post('/ai/inspire/first-round', async (req, res) => {
  try {
    const { photoId, imageUrl, style } = req.body; // style 如 '活泼'、'正式'、'冷酷'

    // 1. 【核心亮点】：分流检查！看看数据库里有没有这张照片对应这个风格的专属抽屉
    const existingSession = await AISession.findOne({ photoId, chosenStyle: style });

    if (existingSession) {
      // 找到了！说明两天前玩过这个风格，直接把当年的记忆和 3 个卡片原封不动吐回去
      console.log(`[智能复用] 照片 ${photoId} 的 【${style}】 风格存在，直接空手套白狼秒回！`);
      return res.json({
        success: true,
        sessionId: existingSession._id,
        chosenStyle: style,
        candidates: existingSession.candidates // 直接复用
      });
    }

    // 2. 没找到旧抽屉，说明是第一次玩这个风格，老老实实走大模型全新生成链路
    const optimizedImageUrl = `${imageUrl}!small`; // 我们的 50KB 极速拦截外挂

    // 系统提示词：强控大模型只围绕当前选择的风格输出 3 个差异化方案
    const systemPrompt = `你是一位精通视觉艺术的独立摄影评论家。请深层分析用户提供的图片，并完全围绕用户指定的【${style}】风格，一口气提供 3 个【彼此不同、各有侧重】的艺术标题与配文方案。`;

    const userPrompt = `请分析这张照片，并严格按照以下 JSON 结构返回 3 个【${style}】风格的备选方案，不要包含任何 markdown 标记或多余的解释文字：
{
  "candidates": [
    { "optionId": 1, "title": "方案一标题", "caption": "方案一配文" },
    { "optionId": 2, "title": "方案二标题", "caption": "方案二配文" },
    { "optionId": 3, "title": "方案三标题", "caption": "方案三配文" }
  ]
}`;

    const initialMessages = [
      {
        role: 'user', content: [
          { type: 'text', text: `${systemPrompt}\n\n${userPrompt}` },
          { type: 'image_url', image_url: { url: optimizedImageUrl } }
        ]
      }
    ];

    // 3. 极速请求智谱大模型
    const response = await fetch('https://open.bigmodel.cn/api/paas/v4/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "glm-4.6v-flash",
        messages: initialMessages,
        response_format: { type: "json_object" } // 强控结构化 JSON 返回
      })
    });

    const data = await response.json();
    const replyContent = data.choices[0].message.content;
    const rawJson = JSON.parse(replyContent);

    // 4. 将本次首轮对话和 3 个初始方案，塞进新建的专属风格抽屉里落盘
    const fullMessages = [
      ...initialMessages,
      { role: 'assistant', content: replyContent }
    ];

    const session = new AISession({
      photoId,
      chosenStyle: style,
      messages: fullMessages,
      candidates: rawJson.candidates
    });

    await session.save();

    // 5. 返回给前端渲染
    res.json({
      success: true,
      sessionId: session._id,
      chosenStyle: style,
      candidates: rawJson.candidates
    });

  } catch (error) {
    console.error("单风格首轮生成失败:", error);
    res.status(500).json({ success: false, message: "服务器内部错误" });
  }
});
module.exports = router;