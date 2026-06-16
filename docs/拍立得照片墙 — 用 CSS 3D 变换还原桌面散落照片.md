# Vue 实战：拍立得照片墙 — 用 CSS 3D 变换还原桌面散落照片

> 本文记录一个模拟拍立得照片散落在桌面上的展示组件的完整实现过程，涵盖图片尺寸预加载与动态比例适配、CSS 3D 翻转卡片、随机散落布局算法、胶带装饰等视觉细节，以及开发过程中关于图片裁剪策略的迭代思考。

## 效果概述

在足迹地图页面点击某个地区后，进入该地区的照片展示页。照片以拍立得风格随机散落在桌面上，每张带有彩色胶带装饰，鼠标悬停时卡片翻转显示照片背面的文字信息（标题、日期、描述）。横图保持原始比例展示，竖图裁剪为 4:5 以保持拍立得的方正感。

## 组件架构

```
Footprints (足迹地图)
└── 点击地区 → $router.push('/photo-desk/:mapCode')
    └── PhotoDesk (拍立得照片墙)
        ├── 顶部导航 (返回足迹地图 + 地区标题)
        ├── 照片桌面 (.photo-desk, 相对定位容器)
        │   └── 散落照片 (.scattered-photo, 绝对定位) × N
        │       └── 翻转卡片 (.photo-card, 3D 变换)
        │           ├── 正面 (.photo-front) — 图片 + 胶带
        │           └── 背面 (.photo-back) — 标题/日期/描述
        └── 加载提示
```

## 一、图片尺寸预加载

照片来源的宽高比不可控，有横有竖。为了让每张卡片按原图比例展示（而非统一裁剪成同一尺寸），需要在渲染前预加载所有图片获取真实尺寸。

### 1.1 预加载函数

```js
const loadImageSize = (src) => new Promise((resolve) => {
  const img = new Image()
  img.onload = () => resolve({ w: img.naturalWidth, h: img.naturalHeight })
  img.onerror = () => resolve({ w: 3, h: 4 })  // 加载失败默认 3:4
  img.src = src
})
```

利用 `Image` 对象的 `naturalWidth` / `naturalHeight` 获取原始像素尺寸。失败时回退到 3:4 避免布局异常。

### 1.2 批量预加载

```js
const sizes = await Promise.all(valid.map(p => loadImageSize(p.src)))
```

`Promise.all` 并发加载所有图片尺寸，网络开销等于单张最慢的那个，不会串行等待。

### 1.3 比例裁剪策略

```js
const CARD_H = 260

const ratio = w / h < 1 ? 4 / 5 : w / h
const cardW = CARD_H * ratio
const cardH = CARD_H
```

| 图片类型 | 判断条件 | 处理方式 | 效果 |
|---|---|---|---|
| 横图 | `w/h >= 1` | 保持原始比例 | 宽度自适应，高度固定 260px |
| 竖图 | `w/h < 1` | 强制裁剪为 4:5 | 宽度收窄，`object-fit: cover` 裁掉上下多余部分 |

竖图如果按原始比例展示会拉得太长，不像拍立得。裁剪为 4:5 后保持了拍立得的方正感，同时比 1:1 更保留一些竖向构图。

## 二、散落布局算法

### 2.1 网格基础定位

照片并非真正的随机摆放，而是基于 4 列网格计算基础位置：

```js
const cols = 4
const cellW = 100 / cols  // 每列 25%

const col = i % cols
const row = Math.floor(i / cols)
const baseX = col * cellW + cellW / 2  // 列中心 X (百分比)
const baseY = row * 400 + 60           // 行 Y (像素)
```

- `i % cols` 让照片在 4 列间循环排列
- `baseX` 取列中心点，使用百分比单位适配不同屏幕宽度
- `baseY` 按 400px 行高递增，留出足够的垂直间距

### 2.2 随机偏移

在网格基础上叠加随机偏移，打破规律感：

```js
const offsetX = (Math.random() - 0.5) * 40   // ±20px 水平偏移
const offsetY = (Math.random() - 0.5) * 30   // ±15px 垂直偏移
const rotate = (Math.random() - 0.5) * 16    // ±8° 旋转角度
```

三个维度的随机性让每张照片看起来像是随手扔在桌上的，而非整齐排列。每次刷新页面偏移值不同，同一组照片也会呈现不同的散落姿态。

### 2.3 样式注入

```js
style: {
  left: `calc(${baseX}% + ${offsetX}px)`,
  top: `${baseY + offsetY}px`,
  width: `${cardW}px`,
  '--card-h': `${cardH}px`,
  '--rotate': `${rotate}deg`,
  zIndex: i,
  animationDelay: `${i * 0.06}s`
}
```

- `left` 用 `calc()` 混合百分比和像素，兼顾响应式和随机偏移
- `width` 和 `--card-h` 根据图片比例动态计算
- `--rotate` 通过 CSS 变量传递给 `transform`，避免内联样式中写复杂的变换函数
- `zIndex` 递增，后渲染的照片盖在前面的上面
- `animationDelay` 逐张递增 60ms，形成依次出现的入场动画

### 2.4 容器高度自适应

```js
const rows = Math.ceil(valid.length / cols)
desk.value.style.height = `${rows * 400 + 120}px`
```

照片使用绝对定位脱离文档流，容器高度需要手动计算撑开，否则底部照片会被裁掉。

## 三、CSS 3D 翻转卡片

### 3.1 翻转原理

```css
.photo-card {
  transform-style: preserve-3d;
  transition: transform 0.5s;
}

.photo-card.is-hovered {
  transform: rotateY(180deg);
}
```

`transform-style: preserve-3d` 让子元素在 3D 空间中排列，而非被压平到 2D。鼠标悬停时卡片绕 Y 轴旋转 180°。

### 3.2 正反面隐藏

```css
.photo-front {
  position: relative;
  backface-visibility: hidden;
}

.photo-back {
  position: absolute;
  inset: 0;
  transform: rotateY(180deg);
  backface-visibility: hidden;
}
```

`backface-visibility: hidden` 是关键——当元素背面朝向观察者时隐藏它。正面默认可见，背面预旋转 180° 隐藏；卡片翻转后，正面隐藏、背面可见，实现正反面切换。

### 3.3 高度撑开策略

正面使用 `position: relative` 作为文档流中的元素，由图片自然撑开高度。背面使用 `position: absolute; inset: 0` 覆盖在正面之上。这样卡片的高度完全由图片决定，无需硬编码。

```css
.photo-front img {
  width: 100%;
  height: var(--card-h, 260px);
  object-fit: cover;
  display: block;
}
```

图片高度通过 CSS 变量 `--card-h` 从 JS 传入，`object-fit: cover` 确保图片填满区域，竖图超出部分被裁剪。

## 四、拍立得视觉细节

### 4.1 卡片质感

```css
.photo-front {
  background: #fffdf5;
  padding: 8px 8px 48px;
  box-shadow:
    0 2px 8px rgba(0, 0, 0, 0.15),
    0 8px 24px rgba(0, 0, 0, 0.1);
}
```

- `#fffdf5` 微黄的纸张底色，模拟老照片的温暖感
- 底部 `48px` 内边距留出拍立得标志性的白边
- 双层 `box-shadow` 模拟卡片浮起的投影效果

### 4.2 胶带装饰

```css
.photo-tape {
  position: absolute;
  width: 60px;
  height: 20px;
  opacity: 0.7;
  top: -6px;
  left: 50%;
  transform: translateX(-50%) rotate(-2deg);
}
```

胶带位于卡片顶部，微微超出边界（`top: -6px`），略带旋转（`-2deg`），模拟随意粘贴的效果。

四种颜色随机分配：

```js
const tapeStyles = ['tape-yellow', 'tape-white', 'tape-pink', 'tape-blue']
tapeClass: tapeStyles[Math.floor(Math.random() * tapeStyles.length)]
```

```css
.tape-yellow {
  background: linear-gradient(180deg,
    rgba(255, 235, 150, 0.8),
    rgba(255, 220, 100, 0.6));
}
```

每种胶带用 `linear-gradient` 做半透明渐变，模拟磨砂胶带的质感。

### 4.3 入场动画

```css
.scattered-photo {
  animation: photo-appear 0.6s ease both;
}

@keyframes photo-appear {
  from {
    opacity: 0;
    transform: translate(-50%, -50%) rotate(var(--rotate)) scale(0.7);
  }
  to {
    opacity: 1;
    transform: translate(-50%, -50%) rotate(var(--rotate)) scale(1);
  }
}
```

每张照片从 70% 大小淡入到原始大小，配合 `animationDelay` 的逐张递增（60ms），形成照片一张张"落"到桌面上的效果。

### 4.4 悬停交互

```css
.scattered-photo:hover {
  z-index: 999 !important;
  transform: translate(-50%, -50%) rotate(0deg) scale(1.15);
}
```

悬停时三件事同时发生：
1. `z-index: 999` 确保当前照片浮到最顶层
2. `rotate(0deg)` 消除随机旋转，照片摆正
3. `scale(1.15)` 放大 15%，聚焦视觉注意力

配合 `cubic-bezier(0.23, 1, 0.32, 1)` 缓动函数，产生有弹性的"吸附"手感。

## 五、响应式适配

```css
@media (max-width: 760px) {
  .scattered-photo {
    max-width: 160px;
  }
}
```

移动端限制照片最大宽度，避免卡片过大导致重叠。由于 `left` 使用百分比定位，列间距会自动收窄，无需额外处理。

## 总结

这个组件的核心挑战在于"如何让照片看起来是随手散落的，而不是整齐排列的"。解法是**网格定位 + 三维度随机偏移**——先用网格保证均匀覆盖，再用随机性打破规律感。图片比例适配则通过预加载获取真实尺寸，横图保持原比例、竖图裁剪为 4:5，在"还原原图"和"保持拍立得感"之间找到平衡。

CSS 3D 翻转卡片的关键就两个属性：`transform-style: preserve-3d` 和 `backface-visibility: hidden`，前者让子元素在三维空间排列，后者让正反面按角度自动切换可见性。
