<template>
  <div class="ai-inspire-container">
    <header class="inspire-header">
      <h2>✨ AI 灵感画册工作台</h2>
      <p>首轮由 VLM 视觉大模型深度感知，后续微调由纯文本闪电引擎极速协同</p>
    </header>

    <div class="cards-grid">
      <div v-for="card in candidates" :key="card.optionId" class="inspire-card"
        :class="{ 'is-loading': loadingCardId === card.optionId }">
        <div v-if="loadingCardId === card.optionId" class="skeleton-wrapper">
          <div class="skeleton-title-bar"></div>
          <div class="skeleton-text-line"></div>
          <div class="skeleton-text-line short"></div>
          <div class="ux-tips-ticker">
            <span class="pulse-dot">●</span> {{ currentUxTip }}
          </div>
        </div>

        <div v-else class="card-content-view">
          <div class="card-badge">方案 {{ card.optionId }}</div>
          <h3 class="card-title">{{ card.title }}</h3>
          <p class="card-caption">{{ card.caption }}</p>

          <div class="card-actions-panel">
            <div class="input-group">
              <input v-model="feedbacks[card.optionId]" type="text" :placeholder="`对方案 ${card.optionId} 有何不满？尽情吐槽...`"
                @keyup.enter="handleIterate(card.optionId)" />
              <button :disabled="loadingCardId !== null" @click="handleIterate(card.optionId)">
                🚀 调整
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <footer class="inspire-footer" v-if="sessionId">
      <span class="status-tag">MongoDB SessionID:</span>
      <code>{{ sessionId }}</code>
    </footer>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'GalleryAIInspire',
  data() {
    return {
      // 🌟 1. 全局抽屉生命周期锁死：首轮接口 1 返回后永久驻留内存
      sessionId: '',

      // 🌟 2. 备选方案状态机：对应后端 Schema 的 candidates 数组
      candidates: [
        { optionId: 1, title: '正在等待首轮生成...', caption: '请先在主页面上传照片并选择风格' },
        { optionId: 2, title: '正在等待首轮生成...', caption: '请先在主页面上传照片并选择风格' },
        { optionId: 3, title: '正在等待首轮生成...', caption: '请先在主页面上传照片并选择风格' }
      ],

      // 🌟 3. 精准局部刷新锁：记录当前哪张卡片正在遭受“反复拉扯修改”（null 表示空闲）
      loadingCardId: null,

      // 🌟 4. 动态吐槽响应式绑定容器（Key为optionId，解决单卡片输入框隔离问题）
      feedbacks: {
        1: '',
        2: '',
        3: ''
      },

      // 🌟 5. 高情商 UX 文案轮播器相关
      uxTips: [
        '正在剥离多模态图片大包，卸载视觉算力延迟...',
        '已强控切换至纯文本专用闪电模型 glm-4-flash...',
        '正在注入 temperature: 0.3 精准微调指令...',
        '正在执行历史陈旧 JSON 动态脱水过滤器...',
        '大模型正在神经网络中进行纯文字润色，请稍候...'
      ],
      currentUxTip: 'AI 正在深度思考...',
      tipTimer: null
    };
  },

  // 模拟生命周期钩子，如果是刚从上一页上传完图片跳转过来，可以在这里调用接口 1
  mounted() {
    // 💡 联调测试：为了让你直接看到效果，我们假设你上传完图跳转过来，自动触发第一轮海选
    this.triggerFirstRoundInit();
  },

  beforeUnmount() {
    this.clearIntervalTimer();
  },

  methods: {
    /**
     * 🏁 动作一：首轮灵感海选（对应后端接口 1）
     * 纯多模态视觉链路，负责建立 MongoDB 会话大抽屉并铺满 3 张初始风格卡片
     */
    async triggerFirstRoundInit() {
      try {
        // 模拟你在 Apifox 里传入的参数，photoId 改成全新的防止老僵尸文档碰瓷
        const payload = {
          photoId: "6a0ab1dc7a4f14d4f4eb5001",
          imageUrl: "https://chiaroscuro-1419307955.cos.ap-guangzhou.myqcloud.com/test.jpg!small",
          style: "冷酷"
        };

        // 占位等待
        this.loadingCardId = 'all'; // 整个矩阵进入等待状态
        this.startUxTipsRotation();

        const res = await axios.post('/api/ai/inspire/first-round', payload);

        if (res.data.success) {
          // 锁死会话 ID，后续生生世世的拉扯全部基于这个 ID 进行
          this.sessionId = res.data.sessionId;
          // 全量铺满 3 套初始风格底稿
          this.candidates = res.data.candidates;
        }
      } catch (error) {
        console.error("首轮全量卡片初始化失败:", error);
      } finally {
        this.loadingCardId = null;
        this.clearIntervalTimer();
      }
    },

    /**
     * 🏎️ 动作二：多轮定向反馈精准迭代（对应后端接口 2）
     * 核心高阶亮点：全自动动态组装 currentContent，实现完美局部精准更新
     */
    async handleIterate(optionId) {
      const userFeedbackText = this.feedbacks[optionId].trim();
      if (!userFeedbackText) {
        alert('小主，请先写下您的修改意见（吐槽）再提交哦！');
        return;
      }

      // 1. 在内存状态机里，自动把被挑中的那张卡片的当前旧内容给抠出来
      const targetCard = this.candidates.find(c => c.optionId === optionId);
      if (!targetCard) return;

      // 2. 开启特定卡片的独立隔离骨架屏，其他卡片保持原样、完全不影响阅读
      this.loadingCardId = optionId;
      this.startUxTipsRotation();

      // 3. 自动化完美组装符合后端规格的 JSON Payload
      const payload = {
        sessionId: this.sessionId,
        optionId: optionId,
        currentContent: {
          title: targetCard.title,     // 👈 浏览器代码全自动抓取，用户彻底无感！
          caption: targetCard.caption  // 👈 浏览器代码全自动抓取，用户彻底无感！
        },
        userFeedback: userFeedbackText // 👈 用户的真实吐槽意见
      };

      try {
        // 请求我们被脱水、降级、降温调优过后的高性能闪电迭代接口
        const res = await axios.post('/api/ai/inspire/iterate', payload);

        if (res.data.success) {
          // 4. 【全栈高光时刻】：通过 JS 在内存中精确查找到卡片下标
          const index = this.candidates.findIndex(c => c.optionId === optionId);
          if (index !== -1) {
            // 5. 局部精准覆盖！Vue 3 的响应式系统会自动触发该卡片的 Fade-in 淡入动画刷新
            this.candidates[index] = res.data.updatedCandidate;
          }
          // 6. 清空该卡片输入框，给用户良好的反馈反馈
          this.feedbacks[optionId] = '';
        }
      } catch (error) {
        console.error(`方案 ${optionId} 迭代优化失败:`, error);
        alert("服务器开小差了，请检查终端爆红或重试");
      } finally {
        // 7. 关闭骨架屏，恢复真实内容卡片展示
        this.loadingCardId = null;
        this.clearIntervalTimer();
      }
    },

    // --- UX 趣味高级辅助函数 ---
    startUxTipsRotation() {
      this.clearIntervalTimer();
      let step = 0;
      this.currentUxTip = this.uxTips[0];
      this.tipTimer = setInterval(() => {
        step++;
        this.currentUxTip = this.uxTips[step % this.uxTips.length];
      }, 1800); // 每 1.8 秒自动轮播一次后端性能优化细节文案
    },
    clearIntervalTimer() {
      if (this.tipTimer) {
        clearInterval(this.tipTimer);
        this.tipTimer = null;
      }
    }
  }
};
</script>

<style scoped>
/* 整个组件的主容器，采用当下最流行的高级灰渐变底色 */
.ai-inspire-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  background-color: #fafafa;
  color: #2c3e50;
}

/* 顶部文案区样式 */
.inspire-header {
  text-align: center;
  margin-bottom: 40px;
}

.inspire-header h2 {
  font-size: 2rem;
  font-weight: 600;
  background: linear-gradient(135deg, #2c3e50 0%, #3498db 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: 10px;
}

.inspire-header p {
  color: #7f8c8d;
  font-size: 0.95rem;
}

/* 三列响应式卡片网格布局 */
.cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 30px;
  margin-bottom: 40px;
}

/* 每一枚灵感卡片的基础样式 */
.inspire-card {
  background: #ffffff;
  border-radius: 16px;
  border: 1px solid #eef2f5;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.02);
  transition: all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1);
  padding: 24px;
  position: relative;
  overflow: hidden;
  min-height: 280px;
  display: flex;
  flex-direction: column;
}

.inspire-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.06);
  border-color: #dbe3eb;
}

/* 专属卡片的局部高阶设计 */
.card-badge {
  display: inline-block;
  padding: 4px 10px;
  background: #f0f4f8;
  color: #34495e;
  font-size: 0.75rem;
  font-weight: bold;
  border-radius: 20px;
  margin-bottom: 16px;
  width: fit-content;
}

.card-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1a252f;
  margin: 0 0 12px 0;
  line-height: 1.4;
}

.card-caption {
  font-size: 0.9rem;
  color: #556677;
  line-height: 1.6;
  margin: 0 0 24px 0;
  flex-grow: 1;
  /* 让文本区自动撑开，保证底部按钮对齐 */
}

/* 卡片底部的交互控制板 */
.card-actions-panel {
  margin-top: auto;
}

.input-group {
  display: flex;
  background: #f5f7f9;
  border: 1px solid #e1e8ed;
  border-radius: 10px;
  padding: 4px;
  transition: all 0.3s ease;
}

.input-group:focus-within {
  border-color: #3498db;
  background: #ffffff;
  box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.1);
}

.input-group input {
  flex-grow: 1;
  border: none;
  background: transparent;
  padding: 8px 12px;
  font-size: 0.85rem;
  color: #2c3e50;
  outline: none;
}

.input-group button {
  background: #2c3e50;
  color: #ffffff;
  border: none;
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 0.85rem;
  cursor: pointer;
  font-weight: 500;
  transition: background 0.2s ease;
}

.input-group button:hover:not(:disabled) {
  background: #34495e;
}

.input-group button:disabled {
  background: #bdc3c7;
  cursor: not-allowed;
}

/* 🌟 核心高光：工业级呼吸灯骨架屏样式 🌟 */
.skeleton-wrapper {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.skeleton-title-bar,
.skeleton-text-line {
  background: linear-gradient(90deg, #f2f4f6 25%, #e6e9ec 37%, #f2f4f6 63%);
  background-size: 400% 100%;
  animation: skeleton-loading 1.4s ease infinite;
  border-radius: 4px;
}

.skeleton-title-bar {
  width: 50%;
  height: 24px;
  margin-bottom: 20px;
}

.skeleton-text-line {
  width: 100%;
  height: 14px;
  margin-bottom: 12px;
}

.skeleton-text-line.short {
  width: 75%;
}

/* 趣味防焦虑文案轮播动画小框 */
.ux-tips-ticker {
  margin-top: auto;
  font-size: 0.78rem;
  color: #95a5a6;
  background: #fafbfc;
  padding: 8px 12px;
  border-radius: 6px;
  border-left: 3px solid #3498db;
  animation: flash-fade 0.5s ease-in-out;
}

.pulse-dot {
  color: #3498db;
  animation: pulse 1s infinite alternate;
}

/* 状态栏样式 */
.inspire-footer {
  text-align: center;
  margin-top: 50px;
  font-size: 0.8rem;
  color: #bdc3c7;
}

.status-tag {
  font-weight: bold;
  color: #95a5a6;
  margin-right: 6px;
}

code {
  background: #f1f2f6;
  padding: 2px 6px;
  border-radius: 4px;
  color: #e74c3c;
}

/* 动画特效定义 */
@keyframes skeleton-loading {
  0% {
    background-position: 100% 0;
  }

  100% {
    background-position: 0% 0;
  }
}

@keyframes pulse {
  0% {
    opacity: 0.3;
  }

  100% {
    opacity: 1;
  }
}
</style>