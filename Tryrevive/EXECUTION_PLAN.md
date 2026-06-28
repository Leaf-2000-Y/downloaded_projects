# Tryrevive 交互网页项目后续执行与 Skills 调度方案

本方案为 **Tryrevive** 心理学自律网页项目的后续完整研发路线图，详细分析了从 ClawHub / awesome-openclaw-skills 收集的 6 大社区 Skill 的兼容性、潜在冲突，并提供了具体的协调策略与预加载配置。

---

## 🎨 一、 引入的 6 大社区 Skills 功能定位

为支撑 Tryrevive 心理自律引导与可视化图谱功能，我们预加载并注册了以下 Skills：

1.  **`awwwards-design` (视觉设计规范)**：提供符合 Awwwards 级别的高级微动效、卡片转场和柔和缓动函数，消除僵硬的页面切换。
2.  **`anti-slop-design` (去 AI 腔设计规范)**：用于在前端编译中拦截生成式 UI 容易夹带的 neon 荧光线条、自转科技圆环、多重网格叠加等“廉价 AI 风味”，保护负熵呼吸感。
3.  **`adaptivetest` (自适应题目引擎)**：负责 CAT 问卷的核心逻辑判定（依据用户当前题目的选择，动态改变下一题的分支路线并汇总心理画像）。
4.  **`anxiety-relief` (焦虑舒缓指导)**：提供 5 分钟箱式呼吸时长定义、冥想自省的文本数据流及气泡泡升起的数据源。
5.  **`agent-topology-visualizer` (双脑情绪拓扑图谱)**：控制 SVG 节点排布坐标，连接用户心理画像的多维状态（自律、沉迷、焦虑度）形成脉动网状双脑图。
6.  **`dynamic-ui` (动态 UI 渲染器)**：用于快速将复杂的 JSON 数组转化为防视线发散（`max-width: 65ch`）的圆润磨砂玻璃卡片。

---

## ⚡ 二、 核心冲突分析与调和方案 (Conflict & Synthesis)

不同 Skill 在共同工作时会产生底层逻辑或视觉上的摩擦，以下是冲突调和规范：

### 1. 动效复杂度冲突 (awwwards-design vs anti-slop-design)
*   **冲突表现**：`awwwards-design` 倾向于使用大范围视差、多层三维倾斜卡片以增强视觉张力；而 `anti-slop-design` 与 `AGENTS.md` 硬性规定禁止视觉堆砌，要求“Less is More”以防对焦虑期的用户产生感官过载。
*   **调和方案**：
    *   保留 `awwwards-design` 中的 **物理阻尼缓动曲线**（`cubic-bezier(0.16, 1, 0.3, 1)`），用于视口的横向滑屏切页（SPA View Transitions）。
    *   **剔除所有三维立体卡片自转和高频光影特效**，确保界面的视觉焦点只停留在“蜡笔质感可爱小人”的步态和“呼吸光晕”上。

### 2. 问卷结构与皮肤冲突 (adaptivetest vs dynamic-ui)
*   **冲突表现**：`adaptivetest` 的原始代码输出未经过修饰的 HTML 原生表单（按钮、单选框极度简陋，不兼容渐变背景），而 `dynamic-ui` 自带标准的磨砂玻璃 (Glassmorphism) 卡片封装。
*   **调和方案**：
    *   **逻辑与渲染解耦**：`adaptivetest` 仅输出状态机 JSON 树，禁用其自带的 `render()`。
    *   **视图层重构**：将题目和选项数组交给 `dynamic-ui`，利用 `label:has(:checked)` 选择器包装为圆角微光按钮，融入整体的宁静主题色中。

### 3. 数据交互与视觉延迟冲突 (agent-topology-visualizer vs Canvas Animation)
*   **冲突表现**：情绪拓扑图谱使用 SVG 渲染大量网络连接线，在移动端容易占用主线程，导致 Canvas “蜡笔小人”行走帧率（FPS）下降，产生顿挫感。
*   **调和方案**：
    *   **离屏渲染与分帧加载**：在小人行走处于 Black 或 Gray 状态下，静默计算 SVG 节点的物理布局；当用户点击进入拓扑看板时，小人行走动画挂起，让出主线程，使用 CSS opacity 淡入 SVG 节点。

---

## 🔒 三、 预加载与哈希白名单注册 (Lock Registry)

所有 preloaded 技能均已在工作区 [skills-lock.json](file:///Users/yiyirowan/Desktop/01_当前进行中/六月游乐场/0609/skills-lock.json) 中完成路径关联与 SHA-256 哈希固化，防御第三方代码注入攻击：

```json
{
  "skills": {
    "trae-auto-clicker": { "computedHash": "0536e5ad1f3a..." },
    "awwwards-design": { "computedHash": "21688be86cc3..." },
    "anti-slop-design": { "computedHash": "73f22b23fc49..." },
    "adaptivetest": { "computedHash": "c38db7a38fcd..." },
    "anxiety-relief": { "computedHash": "0fcecbb26613..." },
    "agent-topology-visualizer": { "computedHash": "72f2a49a7bb3..." },
    "dynamic-ui": { "computedHash": "bff683466847..." }
  }
}
```

---

## 🚀 四、 阶段性后续开发行动方案

后续研发步骤可由本地执行模型（如 Trae / Cursor）依据此方案直接开展：

### 📅 Phase 1: 自适应心理测试 (CAT) 模块集成 (目标: 完成 assessment.html 逻辑)
1.  调用 `adaptivetest` 建立测评状态机，定义自适应心理分支题库。
2.  利用 `dynamic-ui` 编写 glass-card 卡片，实现单题渐隐渐现，答完自动路由至下一题。
3.  测试答题数据缓存于 `localStorage`，最终换算出“专注阻尼”、“成瘾倾向”两项关键维度。

### 📅 Phase 2: SVG 情绪/目标关系图谱构建 (目标: 完成 dashboard.html 逻辑)
1.  调用 `agent-topology-visualizer` 在 Canvas 下方以 SVG 格式绘制情绪网络图。
2.  每个心理节点的位置用基于力导向（Force-directed）的轻量算法进行排布。
3.  SVG 连线的发光颜色绑定用户注册时的主题色（HSL 渐变），通过悬停高亮当前连结。

### 📅 Phase 3: 音频合成与移动端震动唤醒 (目标: 升级 timer.js)
1.  调用 `anxiety-relief` 里面的放松指引节奏。
2.  通过 Web Haptics 接口在成瘾超时（15分钟）后，利用手机物理马达震动，并混合低频呼吸声，实现后台低能耗的“物理唤醒”警报。
