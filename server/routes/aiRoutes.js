// server/routes/aiRoutes.js
const express = require('express');
const router = require('express').Router();
const Photo = require('../models/Photo');
const AISession = require('../models/AISession');

// const apiKey = process.env.ZHIPU_AI_KEY;
// =======================================================
// 📝 AI 独立路由：照片标题与文艺配文灵感生成器（腾讯云样式终盘通车版）
// =======================================================


// 接口 1：首次触发（根据选定风格生成 3 个备选方案，或直接复用历史记录）
router.post('/inspire/first-round', async (req, res) => {
  try {
    const { photoId, imageUrl, style } = req.body; // style 如 '诗意'、'叙事'、'极简'

    // 1. 【核心亮点】：分流检查！看看数据库里有没有这张照片对应这个风格的专属抽屉
    const query = photoId ? { photoId, chosenStyle: style } : { imageUrl, chosenStyle: style };
    const existingSession = await AISession.findOne(query);

    if (existingSession) {
      // 找到了！说明两天前玩过这个风格，直接把当年的记忆和 3 个卡片原封不动吐回去
      return res.json({
        success: true,
        sessionId: existingSession._id,
        chosenStyle: style,
        candidates: existingSession.candidates // 直接复用
      });
    }

    // 2. 没找到旧抽屉，说明是第一次玩这个风格，老老实实走大模型全新生成链路
    const optimizedImageUrl = imageUrl; // 智谱不支持 COS 图片处理后缀，直接用原图 URL

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
        'Authorization': `Bearer ${process.env.ZHIPU_AI_KEY}`
      },
      body: JSON.stringify({
        model: "glm-4.6v-flash",
        messages: initialMessages,
        response_format: { type: "json_object" } // 强控结构化 JSON 返回
      })
    });

    const data = await response.json();

    // 智谱限流 429 或错误码 1305
    if (response.status === 429 || data.error?.code === '1305') {
      return res.status(429).json({ success: false, message: "灵感中枢繁忙，请稍后再试" });
    }

    if (!data.choices || data.choices.length === 0) {
      return res.status(400).json({ success: false, message: "大模型返回异常", errorDetails: data });
    }

    const replyContent = data.choices[0].message.content;
    const rawJson = JSON.parse(replyContent);

    // 4. 将本次首轮对话和 3 个初始方案，塞进新建的专属风格抽屉里落盘
    const fullMessages = [
      ...initialMessages,
      { role: 'assistant', content: replyContent }
    ];

    const session = new AISession({
      photoId: photoId || undefined,
      imageUrl: imageUrl || '',
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


// 接口 2：真正的多轮文字拉扯链路（严格保留所有文字历史，仅在传输前对第一轮图片“蒸发”隔离）
router.post('/inspire/iterate', async (req, res) => {
  try {
    const { sessionId, optionId, currentContent, userFeedback } = req.body;

    const session = await AISession.findById(sessionId);
    if (!session) {
      return res.status(404).json({ success: false, message: "该 AI 会话不存在" });
    }

    // 1. 【核心优化】：对历史记忆进行大扫除，彻底剥离过时的 JSON 结构
    let memoryMessages = [];

    session.messages.forEach((msg, index) => {
      if (index === 0) {
        // 第一轮用户的多模态请求，只留文字，干掉图片
        if (Array.isArray(msg.content)) {
          const textObj = msg.content.find(item => item.type === 'text');
          memoryMessages.push({ role: 'user', content: textObj ? textObj.text : "生成文案" });
        } else {
          memoryMessages.push({ role: 'user', content: msg.content });
        }
      } else if (msg.role === 'assistant') {
        // 🌟🌟 绝杀清洗：如果历史记录是 AI 回复的 JSON，我们只提取里面的核心文本，把沉重的 JSON 外壳砸碎！
        try {
          const parsed = JSON.parse(msg.content);
          // 如果里面包含单版本，或者是初始的 candidates 数组
          if (parsed.candidates) {
            const list = parsed.candidates.map(c => `方案${c.optionId}: [${c.title}] - ${c.caption}`).join('\n');
            memoryMessages.push({ role: 'assistant', content: `这是我当时生成的初始底稿：\n${list}` });
          } else {
            memoryMessages.push({ role: 'assistant', content: `这是我上一次修改后的成品：标题是【${parsed.title}】，配文是【${parsed.caption}】` });
          }
        } catch (e) {
          // 如果本来就是普通文本，保持原样
          memoryMessages.push({ role: 'assistant', content: msg.content });
        }
      } else {
        // 用户提的文字意见，正常保留
        memoryMessages.push({ role: msg.role, content: msg.content });
      }
    });

    // 2. 【滑动窗口严格瘦身】不管用户反复点了多少次，发给大模型的拉扯历史永远只留最近 2 轮！
    // 这样记忆链条极度干净，大模型推理没有任何因果负担
    if (memoryMessages.length > 6) {
      const firstRoundUser = memoryMessages[0];
      const firstRoundAssistant = memoryMessages[1];
      const recentConversations = memoryMessages.slice(-4); // 只留最近两轮的用户吐槽和AI回应
      memoryMessages = [firstRoundUser, firstRoundAssistant, ...recentConversations];
    }

    // 3. 组装当前最新一轮指令
    const currentTurnInstruction = `【当前严格微调任务】
请保持【${session.chosenStyle}】风格，针对方案 [${optionId}] 进行微调。
该方案当前底稿：标题 "${currentContent.title}"，配文 "${currentContent.caption}"
用户的最新修改意见："${userFeedback}"
直接返回修改后的纯 JSON 对象，不要带任何 markdown 标识或多余废话：
{ "optionId": ${optionId}, "title": "新标题", "caption": "新配文" }`;

    memoryMessages.push({ role: 'user', content: currentTurnInstruction });

    // 4. 用纯文本专用闪电模型发起高并发请求
    const response = await fetch('https://open.bigmodel.cn/api/paas/v4/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.ZHIPU_AI_KEY}`
      },
      body: JSON.stringify({
        model: "glm-4.5-flash", // 👈 锁死纯文本闪电模型
        messages: memoryMessages,
        response_format: { type: "json_object" },
        temperature: 0.6
      })
    });

    const data = await response.json();
    if (!data.choices || data.choices.length === 0) {
      return res.status(400).json({ success: false, message: "大模型微调接口报错", errorDetails: data });
    }

    const replyContent = data.choices[0].message.content;
    let cleanContent = replyContent.replace(/```json/g, '').replace(/```/g, '').trim();
    const updatedResult = JSON.parse(cleanContent);

    // 5. 状态机落盘（保持原样，记录真实拉扯）
    session.messages.push({ role: 'user', content: `[修改方案${optionId}]: ${userFeedback}` });
    session.messages.push({ role: 'assistant', content: replyContent });

    const index = session.candidates.findIndex(c => c.optionId === Number(optionId));
    if (index !== -1) {
      session.candidates[index].title = updatedResult.title;
      session.candidates[index].caption = updatedResult.caption;
    }

    await session.save();

    res.json({ success: true, updatedCandidate: updatedResult });

  } catch (error) {
    console.error("多轮迭代失败:", error);
    res.status(500).json({ success: false, message: "服务器内部错误" });
  }
});
module.exports = router;