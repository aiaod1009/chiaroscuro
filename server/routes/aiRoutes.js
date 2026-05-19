// server/routes/aiRoutes.js
const express = require('express');
const router = require('express').Router();
const Photo = require('../models/Photo');
const AISession = require('../models/AISession');

// const apiKey = process.env.ZHIPU_AI_KEY;
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


// 接口 1：首次触发（根据选定风格生成 3 个备选方案，或直接复用历史记录）
router.post('/inspire/first-round', async (req, res) => {
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
        'Authorization': `Bearer ${process.env.ZHIPU_AI_KEY}`
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

// 接口 2：多轮迭代（只针对当前风格抽屉下的某一个方案进行微调）
// router.post('/inspire/iterate', async (req, res) => {
//   try {
//     const { sessionId, optionId, currentContent, userFeedback } = req.body;

//     // 1. 精准捞出这个专属风格的抽屉记录
//     const session = await AISession.findById(sessionId);
//     if (!session) {
//       return res.status(404).json({ success: false, message: "该 AI 会话不存在" });
//     }

//     let memoryMessages = [...session.messages];
//     // 【工业级滑动窗口】：只保留首轮带图的和最近 4 轮的针锋相对，防止对话过长导致大模型视觉疲劳
//     if (memoryMessages.length > 8) {
//       const firstRound = memoryMessages[0];
//       const firstReply = memoryMessages[1];
//       const recentMems = memoryMessages.slice(-4);
//       memoryMessages = [firstRound, firstReply, ...recentMems];
//     }

//     // 2. 精准编写微调指令，明确指出修改哪个方案以及用户的吐槽
//     const iterateInstruction = `用户看中了刚才生成的第 [${optionId}] 个方案。
// 该方案当前的内容为：
// 标题："${currentContent.title}"
// 配文："${currentContent.caption}"

// 用户的修改意见是："${userFeedback}"。
// 请继续保持【${session.chosenStyle}】的整体风格，并结合图片意境，严格针对这个方案进行修改优化。直接返回修改后的纯 JSON 对象：
// { "optionId": ${optionId}, "title": "微调后的新标题", "caption": "微调后的新配文" }`;

//     // 3. 将吐槽追加到这个独立抽屉的记忆链条中
//     memoryMessages.push({
//       role: 'user',
//       content: iterateInstruction
//     });

//     // 4. 发送给大模型进行定向修图
//     const response = await fetch('https://open.bigmodel.cn/api/paas/v4/chat/completions', {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//         'Authorization': `Bearer ${process.env.ZHIPU_AI_KEY}`
//       },
//       body: JSON.stringify({
//         model: "glm-4.6v-flash",
//         messages: memoryMessages, // 纯净的同风格历史
//         response_format: { type: "json_object" }
//       })
//     });

//     const replyContent = data.choices[0].message.content;
//     const updatedResult = JSON.parse(replyContent); // 拿到精准微调后的单个方案

//     // 5. 【状态机同步】：把新对话追加进这个抽屉，同时在备选池（candidates）里把老方案覆盖掉
//     session.messages.push({ role: 'user', content: iterateInstruction });
//     session.messages.push({ role: 'assistant', content: replyContent });

//     const index = session.candidates.findIndex(c => c.optionId === Number(optionId));
//     if (index !== -1) {
//       session.candidates[index].title = updatedResult.title;
//       session.candidates[index].caption = updatedResult.caption;
//     }

//     await session.save();

//     // 6. 返回给前端，前端局部刷新对应的卡片
//     res.json({
//       success: true,
//       updatedCandidate: updatedResult
//     });

//   } catch (error) {
//     console.error("方案微调迭代失败:", error);
//     res.status(500).json({ success: false, message: "服务器内部错误" });
//   }
// });
// 接口 2：多轮迭代（卸载多模态图片，全文本极速微调链路）
router.post('/inspire/iterate', async (req, res) => {
  try {
    const { sessionId, optionId, currentContent, userFeedback } = req.body;

    // 1. 从数据库捞出这笔专属风格的抽屉记录
    const session = await AISession.findById(sessionId);
    if (!session) {
      return res.status(404).json({ success: false, message: "该 AI 会话不存在" });
    }

    // 2. 【核心大改动：视文解耦清洗】
    // 将数据库里存的所有历史消息深拷贝一份出来处理，防止污染数据库本身
    let memoryMessages = JSON.parse(JSON.stringify(session.messages));

    // 🌟🌟 绝杀逻辑：遍历并卸载掉第一轮里面的 image_url
    memoryMessages = memoryMessages.map(msg => {
      // 如果发现某一条历史记录的 content 是一个多模态数组，我们要把它“纯文本化”
      if (Array.isArray(msg.content)) {
        // 找到里面类型为 text 的那一段指令
        const textObj = msg.content.find(item => item.type === 'text');
        return {
          role: msg.role,
          content: textObj ? textObj.text : "分析之前的那张照片" // 扔掉图片URL，只留文本指令
        };
      }
      return msg; // 已经是纯文本的对话保持原样
    });

    // 3. 【工业级滑动窗口】限制对话长度（保留首轮纯文本化的基础和最近 4 轮拉扯）
    if (memoryMessages.length > 8) {
      const firstRound = memoryMessages[0];
      const firstReply = memoryMessages[1];
      const recentMems = memoryMessages.slice(-4);
      memoryMessages = [firstRound, firstReply, ...recentMems];
    }

    // 4. 精准编写微调指令，告诉模型不用看图了，基于记忆修改
    const iterateInstruction = `你拥有对之前照片的视觉记忆。用户看中了刚才生成的第 [${optionId}] 个方案。
该方案当前内容为：
标题："${currentContent.title}"
配文："${currentContent.caption}"

用户的修改意见是："${userFeedback}"。
请继续保持【${session.chosenStyle}】的整体风格，并结合你对图片的视觉记忆，严格针对这个方案进行修改优化。直接返回修改后的纯 JSON 对象，不要带任何 markdown 标记：
{ "optionId": ${optionId}, "title": "微调后的新标题", "caption": "微调后的新配文" }`;

    // 5. 将吐槽追加到纯文本记忆链条中
    memoryMessages.push({
      role: 'user',
      content: iterateInstruction
    });

    // 6. 带着【纯文本轻量级记忆】极速请求智谱大模型
    const response = await fetch('https://open.bigmodel.cn/api/paas/v4/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.ZHIPU_AI_KEY}`
      },
      body: JSON.stringify({
        model: "glm-4.6v-flash",
        messages: memoryMessages,
        response_format: { type: "json_object" }
      })
    });

    const data = await response.json();

    // 安全防御门：防止智谱异常
    if (!data.choices || data.choices.length === 0) {
      console.error("智谱 API 迭代返回了异常数据：", data);
      return res.status(400).json({ success: false, message: "大模型微调接口报错", errorDetails: data });
    }

    const replyContent = data.choices[0].message.content;
    let cleanContent = replyContent.replace(/```json/g, '').replace(/```/g, '').trim();
    const updatedResult = JSON.parse(cleanContent);

    // 7. 【状态机落盘】：存入数据库的历史消息依然可以保留多模态（或者存文本），把当前修改覆盖到卡片池
    session.messages.push({ role: 'user', content: iterateInstruction });
    session.messages.push({ role: 'assistant', content: replyContent });

    const index = session.candidates.findIndex(c => c.optionId === Number(optionId));
    if (index !== -1) {
      session.candidates[index].title = updatedResult.title;
      session.candidates[index].caption = updatedResult.caption;
    }

    await session.save();

    // 8. 返回给前端，实现前端卡片的局部刷新
    res.json({
      success: true,
      updatedCandidate: updatedResult
    });

  } catch (error) {
    console.error("纯文本方案微调迭代失败:", error);
    res.status(500).json({ success: false, message: "服务器内部错误" });
  }
});

module.exports = router;