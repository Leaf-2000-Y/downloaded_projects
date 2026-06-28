// Tryrevive MVP 三期核心控制系统 - 谷歌极简首页、矢量花叶HSL无极调节、智能MBTI梦想警示语、无眼蜡笔Chubby桌宠、不规则云雾气泡与手写自定心语

// --- 1. 静态数据配置 (测试题/自适应话术库/气泡) ---
const QUIZ_QUESTIONS = [
  {
    text: "1. 当你感到精神疲惫时，你更倾向于？",
    options: [
      { text: "独自一人待在安静的空间里放空", type: "I" },
      { text: "与朋友倾诉或去户外寻找新的刺激", type: "E" }
    ]
  },
  {
    text: "2. 你更容易因为什么感到焦虑或心浮气躁？",
    options: [
      { text: "具体的待办事项越积越多，时间不够用", type: "J" },
      { text: "对未来的长远规划或人生目标感到迷茫", type: "P" }
    ]
  },
  {
    text: "3. 当你的学习/工作计划被打乱时，你最需要？",
    options: [
      { text: "迅速找出逻辑成因，并冷静重排待办", type: "T" },
      { text: "先接纳自己的情绪，寻找温和的心理缓冲", type: "F" }
    ]
  },
  {
    text: "4. 你更习惯以什么样的方式去探索一个新领域？",
    options: [
      { text: "收集宏观概念和本质规律，再进行抽象联想", type: "N" },
      { text: "从具体实例和物理数据入手，一步一个脚印", type: "S" }
    ]
  },
  {
    text: "5. 你目前感到自律受挫、最想要通过网页平复的是？",
    options: [
      { text: "频繁刷手机或看短视频带来的空虚成瘾", type: "A" }, // Addiction
      { text: "面对棘手任务时产生的严重拖延和畏难", type: "D" }, // Delay
      { text: "因琐碎交际或学业压力带来的莫名烦躁", type: "V" }  // Vexation
    ]
  }
];

// 自适应 16种 MBTI × 3种核心痛点 梦想警句模板 (随机选一)
const MBTI_COACH_TEMPLATES = {
  // J 类型人格：强计划、物理做功
  TJ: {
    A: [
      "继续沉溺在低信息熵的算法中，你距离『{motivation}』的物理偏差将扩大 1.5 小时。立即修正！",
      "警报：算法推荐已劫持了你的 TJ 专注环路。梦想『{motivation}』正受到干扰。切回你的第二步『{step2}』！",
      "算一算时间账：如果今天你在这个网页上失守，你制定的第三步计划『{step3}』将彻底被推迟。",
      "推荐流是针对你意志力的饱和攻击。如果连今天的注意力都无法规划，如何掌控更宏大的『{motivation}』目标？",
      "警告：今日时间预算正被非建设性行为消耗。立刻关闭当前页面，切回主视图执行第一步。"
    ],
    D: [
      "拖延并不能打败复杂，只有物理做功可以。开始你的第一步目标，为梦想『{motivation}』注入能量。",
      "检测到强烈的抗拒情绪。请执行微小第一步，这只需要 10 秒。立刻纠偏！",
      "计划正在脱轨。 TJ 应当依靠秩序战胜畏难。今日今日计划在呼唤你，立刻执行第一步！",
      "完美的计划如果不能执行，其净值为零。现在启动第一步，恢复对今天行动线的控制。",
      "不要在脑中进行无意义的项目评估。现在就开始行动，用实质的做功来终结焦虑。"
    ],
    V: [
      "琐碎噪音正在消耗你的计算力。请立刻切回 Tryrevive，隔绝外界烦躁，捍卫『{motivation}』。",
      "情绪波动时，行动是最好的稳定器。专注于你刚才定下的步骤『{step2}』。",
      "让脑海里的噪音平息。现在退出社交软件，重新夺回你对生活的目标掌控。",
      "琐碎的信息和无意义的争执是对心智资源的低效占用。关闭它，回到有确定性的轨道上来。",
      "当你感到秩序感丧失、内心烦躁时，完成一个小小的物理步骤是恢复掌控感的最快途径。"
    ]
  },
  FJ: {
    A: [
      "Rowan，你先前刻下了对未来的希冀『{motivation}』。现在的推荐流真的能让你感到平静吗？",
      "在这个算法洪流里没有你真正的伙伴。回想起你的初心，切回你的第二步计划『{step2}』。",
      "对自我的掌控是最大的安全感。不要用短暂的娱乐，敷衍你宏大的目标『{motivation}』。",
      "不要在虚拟的信息流中寻找温暖。你的现实目标『{motivation}』和身边真正需要你的人，正等你归来。",
      "每一次随波逐流都是对自我信任的侵蚀。合上页面，重新对自己负起责任来。"
    ],
    D: [
      "你本是个极度负责的人，不要让拖延伤害了你对自我的期许。梦想『{motivation}』正等你动身。",
      "万事开头难，但请接纳目前的不完美，踏出第一步。你的梦想承诺不是废纸。",
      "今日的小卡片『{step2}』正在等待你。温和地开启它，你并不是一个人在战斗。",
      "别给自己太大压力，不需要做到尽善尽美。先完成哪怕最微小的一个动作，这就是对你梦想最好的呵护。",
      "逃避行动只会积攒对自我的内疚。原谅自己，然后从今天最简单的第一步开始做起。"
    ],
    V: [
      "社交与交际的消耗应当在这里被洗涤。请深呼吸，用宁静色包裹自己，捍卫初心『{motivation}』。",
      "接纳当下的焦躁，将视线收回到你对生活的规划『{step2}』中，世界会安静下来。",
      "安静待在你的 Tryrevive 起始页中，不要让外界的声音撕裂了你原本的梦想。",
      "外界的喧嚣是他们未被疗愈的焦虑，不要让它传染给你。回到你精心布置的宁静角落。",
      "如果人际关系让你感到沉重和疲惫，请暂时切断与外界的连接，在这里安顿你的心神。"
    ]
  },
  // P 类型人格：强灵感、弹性探索
  TP: {
    A: [
      "逻辑泄露警报：你刚才的注意力设防被社交算法击穿了。目标『{motivation}』已挂起！",
      "不要让廉价的短视频定义了你今天的终点。你本计划开始第二步『{step2}』的。",
      "你的注意力本是极其昂贵的分析资产，不要白白送给推荐流。切回计划『{step3}』！",
      "用你卓越的理智分析一下：这个不断给你喂食低质多巴胺的算法，难道不觉得是一种智力降级吗？",
      "这套算法是专门针对你大脑的漏洞设计的。退出这场心智操纵，拿回你的主权。"
    ],
    D: [
      "灵感只在做功的瞬间产生。立刻踏出你的第一步，哪怕只关掉一个无关标签。",
      "自律并不是限制，而是彻底掌控你弹性人生的核动力。去执行你的第一步『{step2}』。",
      "目标『{motivation}』正处于休眠期。启动你的破局点，看看能延伸出什么精妙解法。",
      "理性的思考如果不转化为实际的代码或物理行动，就只是头脑中的空转。动起来！",
      "不要试图一次性解决所有难题。把你的大系统拆解开，先切入第一步『{step2}』。"
    ],
    V: [
      "外界的莫名烦躁只是低维数据污染。切回 Tryrevive 起始页进行低噪重构。",
      "计划被打乱了也没关系，TP 擅长弹性修正。关注当下的第二步『{step2}』。",
      "关闭低价值信息源。你的头脑极其宝贵，只留给真正有智识增量的事物『{motivation}』。",
      "面对混乱和噪音，不要情绪化，用分析的眼光看待它，然后冷静地把它们从视野里过滤掉。",
      "去寻找本质的规律，而不是被表面的泡沫激怒。闭上眼睛，重新建立你的内部秩序。"
    ]
  },
  FP: {
    A: [
      "算法推荐里只有重复和死板的复制，没有你独特的灵魂和创意。梦想『{motivation}』在呼唤你。",
      "Rowan，回想起你最渴望的初心『{motivation}』。去亲手创造它，而不是看着别人刷屏。",
      "从低多巴胺的无聊中清醒过来。你的第二步『{step2}』本有无限可能，去激活它！",
      "这个世界塞满了被批量制造的流行，只有你亲自动手做的事情，才真正带有你的印记。为了『{motivation}』，切回吧。",
      "别让千篇一律的 Feed 流剥夺了你的灵气。去开始属于你的、独一无二的心流旅程。"
    ],
    D: [
      "接纳当前的拖延状态，这只是你的身体在积蓄灵感。但请为了梦想『{motivation}』，轻轻踏出第一步。",
      "不需要一步做到完美，只做 1% 也是伟大的开始。去开启你的破局小卡片吧。",
      "为了能无拘无束地探索世界，现在就开始物理做功，去扫除眼前的微小障碍。",
      "如果觉得目标太沉重，就先做点好玩的、好玩的小事。你的灵感会在做功中自然苏醒。",
      "拖延只是因为你太在乎这件作品的成色了。允许自己先交出一份粗糙的草稿，去走第一步。"
    ],
    V: [
      "这个世界太嘈杂了。请躲进你亲手挑选的植物花叶色环里，抚平疲惫，保护梦想『{motivation}』。",
      "情绪的潮汐终会退去。在这个属于你自己的心流空间里，静静写下你的第二步『{step2}』。",
      "接纳焦躁，释放自责。看着你选的主题色，让内心重回深海般的平静。",
      "外界的评判与你的内在价值毫无关联。深呼吸，守护你内心对『{motivation}』的纯净火焰。",
      "在这里，你可以卸下所有的伪装和面具。让这片宁静的对比色拥抱你，重新找回自我的节奏。"
    ]
  }
};

const BUBBLE_TEXTS = [
  "你真的想浪费时间在并不会提升自己的娱乐上面吗？",
  "用这个时间，你能创造更多的价值",
  "稍微停一下，深呼吸，感受现在的身体状况",
  "你的注意力是这个世界上最昂贵的商品，别免费送给算法",
  "放下刷屏的手，抬起头看看周围",
  "别让下一段短视频定义了你今天的终点",
  "如果今天是你余生的第一天，你想怎么度过？",
  "自律不是限制，而是为了彻底掌控人生的自由"
];

// --- 2. 核心状态管理 ---
const state = {
  currentUser: "",
  userProfile: {
    nickname: "",
    password: "",
    mbti: "INTJ-A",
    motivation: "逃离算法洪流，自律重生。",
    customQuote: "", // 用户自定心语
    calmingColor: { h: 160, s: 12, l: 50 }, // HSL with custom lightness
    showPet: false, // 桌宠小人开启/隐藏开关
    apiKey: "", // Anthropic API Key
    currentGoal: "",
    firstStep: "",
    step2: "",
    step3: "",
    quizAnswers: [],
    
    // User Custom App Dock config
    appDock: [
      { id: "xiaohongshu", name: "小红书", url: "https://www.xiaohongshu.com", color: "#ef4444" },
      { id: "bilibili", name: "B站", url: "https://www.bilibili.com", color: "#00a1d6" },
      { id: "douyin", name: "抖音", url: "https://www.douyin.com", color: "#1c1c24" },
      { id: "weibo", name: "微博", url: "https://weibo.com", color: "#e6162d" },
      { id: "taobao", name: "淘宝", url: "https://www.taobao.com", color: "#ff5000" },
      { id: "pinduoduo", name: "拼多多", url: "https://www.pinduoduo.com", color: "#e02e24" },
      { id: "netease", name: "网易云", url: "https://music.163.com", color: "#c20c0c" }
    ]
  },
  activeView: "narrative",
  avatarState: "gray",       // "black" | "gray" | "white"
  avatarAction: "walk",       // black: "cry"|"crawl", gray: "walk"|"think", white: "jump"|"wave"
  meditationActive: false,
  meditationTotalTime: 300,
  timerInterval: null,
  timeLeft: 300,
  awayStartTime: null,
  
  // Blocker loop state
  blockerTimerActive: false,
  blockerTargetSite: "",
  blockerTargetUrl: "",
  blockerTimeLimitSec: 0,
  blockerStartTime: null,
  blockerInterval: null,
  
  // Dock Edit Mode state
  dockEditMode: false,
  
  canvasAnimIds: {
    avatar: null,
    galaxy: null,
    meditationAvatar: null,
    cloudBubble: null,
    sprout: null
  },
  actionSwitchInterval: null
};

// --- 3. 音频合成系统 (Web Audio API Synthesizer) ---
let audioCtx = null;
let wavesNode = null;
let wavesGain = null;
let wavesFilter = null;
let heartbeatInterval = null;

function initAudio() {
  if (audioCtx) return;
  audioCtx = new (window.AudioContext || window.webkitAudioContext)();
}

function startOceanWaves() {
  try {
    initAudio();
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    
    const bufferSize = 2 * audioCtx.sampleRate;
    const noiseBuffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    let lastOut = 0.0;
    
    // Brownian Noise low rumble tide effect
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      output[i] = (lastOut + (0.02 * white)) / 1.02;
      lastOut = output[i];
      output[i] *= 3.5;
    }
    
    wavesNode = audioCtx.createBufferSource();
    wavesNode.buffer = noiseBuffer;
    wavesNode.loop = true;
    
    wavesFilter = audioCtx.createBiquadFilter();
    wavesFilter.type = "lowpass";
    wavesFilter.frequency.setValueAtTime(300, audioCtx.currentTime);
    
    wavesGain = audioCtx.createGain();
    wavesGain.gain.setValueAtTime(0.08, audioCtx.currentTime);
    
    wavesNode.connect(wavesFilter);
    wavesFilter.connect(wavesGain);
    wavesGain.connect(audioCtx.destination);
    
    wavesNode.start();
  } catch (e) {
    console.error("Audio Waves start failed:", e);
  }
}

function modulateWaves(phase) {
  if (!audioCtx || !wavesFilter || !wavesGain) return;
  const t = audioCtx.currentTime;
  if (phase === "inhale") {
    wavesFilter.frequency.exponentialRampToValueAtTime(450, t + 4);
    wavesGain.gain.linearRampToValueAtTime(0.12, t + 4);
  } else if (phase === "exhale") {
    wavesFilter.frequency.exponentialRampToValueAtTime(180, t + 4);
    wavesGain.gain.linearRampToValueAtTime(0.02, t + 4);
  }
}

function stopOceanWaves() {
  if (wavesNode) {
    try {
      wavesNode.stop();
    } catch (e) {}
    wavesNode = null;
  }
}

function playSingleHeartbeat() {
  if (!audioCtx) initAudio();
  if (audioCtx.state === 'suspended') audioCtx.resume();
  
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  
  osc.type = "sine";
  osc.frequency.setValueAtTime(65, audioCtx.currentTime);
  
  gain.gain.setValueAtTime(0, audioCtx.currentTime);
  gain.gain.linearRampToValueAtTime(0.5, audioCtx.currentTime + 0.04);
  gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.25);
  
  gain.gain.setValueAtTime(0, audioCtx.currentTime + 0.28);
  gain.gain.linearRampToValueAtTime(0.3, audioCtx.currentTime + 0.32);
  gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.55);
  
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.start();
  osc.stop(audioCtx.currentTime + 0.6);
}

function startHeartbeatLoop() {
  stopHeartbeatLoop();
  playSingleHeartbeat();
  heartbeatInterval = setInterval(playSingleHeartbeat, 1200);
}

function stopHeartbeatLoop() {
  if (heartbeatInterval) {
    clearInterval(heartbeatInterval);
    heartbeatInterval = null;
  }
}

// --- 4. 页面过渡控制 (SPA Router) ---
function switchView(viewName) {
  if (state.canvasAnimIds.avatar) cancelAnimationFrame(state.canvasAnimIds.avatar);
  if (state.canvasAnimIds.galaxy) cancelAnimationFrame(state.canvasAnimIds.galaxy);
  if (state.canvasAnimIds.meditationAvatar) cancelAnimationFrame(state.canvasAnimIds.meditationAvatar);
  if (state.canvasAnimIds.cloudBubble) cancelAnimationFrame(state.canvasAnimIds.cloudBubble);
  if (state.canvasAnimIds.sprout) cancelAnimationFrame(state.canvasAnimIds.sprout);
  if (state.timerInterval) clearInterval(state.timerInterval);
  state.meditationActive = false;
  stopOceanWaves();
  stopPetServerPolling(); // Stop polling when switching away from any view

  const screens = document.querySelectorAll(".view-screen");
  screens.forEach(screen => screen.classList.remove("active"));

  const targetScreen = document.getElementById(`view-${viewName}`);
  if (targetScreen) {
    targetScreen.classList.add("active");
  }
  state.activeView = viewName;

  // Initialize specific page logics
  if (viewName === "home") {
    // Dock Edit Mode disabled by default
    state.dockEditMode = false;
    const editBtn = document.getElementById("edit-dock-btn");
    if (editBtn) editBtn.innerHTML = "<span>✏️ 编辑管理</span>";
    
    renderAppDock();
    
    // MBTI template warning pre-generation & synchronization
    syncWarningMotivationalDOM();
    
  } else if (viewName === "meditation") {
    const setupOverlay = document.getElementById("meditation-setup-overlay");
    const goalReview = document.getElementById("meditation-goal-review");
    const setupInput = document.getElementById("meditation-setup-quote");
    
    if (setupOverlay) setupOverlay.style.display = "flex";
    if (goalReview) {
      goalReview.textContent = state.userProfile.firstStep ? 
        `今日设防目标：${state.userProfile.firstStep}` : 
        `今日设防目标：专注当下，自我对话`;
    }
    if (setupInput) setupInput.value = state.userProfile.customQuote || "";
    
  } else if (viewName === "onboarding") {
    // Fill text inputs from state
    const customQuoteInput = document.getElementById("input-custom-quote");
    const motivationInput = document.getElementById("input-motivation");
    const apiKeyInput = document.getElementById("input-api-key");
    if (customQuoteInput) customQuoteInput.value = state.userProfile.customQuote || "";
    if (motivationInput) motivationInput.value = state.userProfile.motivation || "";
    if (apiKeyInput) apiKeyInput.value = state.userProfile.apiKey || "";
    
    renderColorWreath();
    startPetServerPolling(); // Start polling when entering onboarding/settings view
  } else if (viewName === "narrative") {
    NARRATIVE_LINES.forEach(id => {
      const el = document.getElementById(id);
      if (el) el.classList.remove("visible", "typing-cursor");
    });
    const footer = document.getElementById("narrative-footer");
    if (footer) footer.style.opacity = "0";
    initNarrativeSproutCanvas();
  }
}

// --- 5. 账号系统与 LocalStorage 存档 ---
function loadUserProfile(username) {
  const save = localStorage.getItem(`tryrevive_save_${username}`);
  if (!save) return null;
  try {
    const loaded = JSON.parse(save);
    
    // Safety compatibility fallbacks to prevent load crash
    if (!loaded.appDock) {
      loaded.appDock = [
        { id: "xiaohongshu", name: "小红书", url: "https://www.xiaohongshu.com", color: "#ef4444" },
        { id: "bilibili", name: "B站", url: "https://www.bilibili.com", color: "#00a1d6" },
        { id: "douyin", name: "抖音", url: "https://www.douyin.com", color: "#1c1c24" },
        { id: "weibo", name: "微博", url: "https://weibo.com", color: "#e6162d" },
        { id: "taobao", name: "淘宝", url: "https://www.taobao.com", color: "#ff5000" },
        { id: "pinduoduo", name: "拼多多", url: "https://www.pinduoduo.com", color: "#e02e24" },
        { id: "netease", name: "网易云", url: "https://music.163.com", color: "#c20c0c" }
      ];
    }
    if (loaded.calmingColor === undefined) {
      loaded.calmingColor = { h: 160, s: 12, l: 50 };
    }
    if (loaded.calmingColor.l === undefined) {
      loaded.calmingColor.l = 50;
    }
    if (loaded.showPet === undefined) {
      loaded.showPet = false;
    }
    if (loaded.petStyle === undefined) {
      loaded.petStyle = "B";
    }
    if (loaded.quizAnswers === undefined) {
      loaded.quizAnswers = [];
    }
    return loaded;
  } catch (e) {
    console.error("Failed to parse user profile:", e);
    return null;
  }
}

function handleRegister() {
  const userEl = document.getElementById("login-username");
  const passEl = document.getElementById("login-password");
  const usernameInput = userEl ? userEl.value.trim() : "";
  const passwordInput = passEl ? passEl.value.trim() : "";

  if (!usernameInput || !passwordInput) {
    alert("请输入存档名称与密码密码以设立关卡。");
    return;
  }

  const existing = localStorage.getItem(`tryrevive_save_${usernameInput}`);
  if (existing) {
    alert("该存档已存在，载入请点击“载入旧存档”。");
    return;
  }

  state.currentUser = usernameInput;
  state.userProfile = {
    nickname: usernameInput,
    password: passwordInput,
    mbti: "INTJ-A",
    motivation: "",
    customQuote: "",
    calmingColor: { h: 160, s: 12, l: 50 },
    showPet: false,
    petStyle: "B",
    currentGoal: "",
    firstStep: "",
    step2: "",
    step3: "",
    quizAnswers: [],
    
    appDock: [
      { id: "xiaohongshu", name: "小红书", url: "https://www.xiaohongshu.com", color: "#ef4444" },
      { id: "bilibili", name: "B站", url: "https://www.bilibili.com", color: "#00a1d6" },
      { id: "douyin", name: "抖音", url: "https://www.douyin.com", color: "#1c1c24" },
      { id: "weibo", name: "微博", url: "https://weibo.com", color: "#e6162d" },
      { id: "taobao", name: "淘宝", url: "https://www.taobao.com", color: "#ff5000" },
      { id: "pinduoduo", name: "拼多多", url: "https://www.pinduoduo.com", color: "#e02e24" },
      { id: "netease", name: "网易云", url: "https://music.163.com", color: "#c20c0c" }
    ]
  };

  startQuiz();
}

function handleLogin() {
  const userEl = document.getElementById("login-username");
  const passEl = document.getElementById("login-password");
  const usernameInput = userEl ? userEl.value.trim() : "";
  const passwordInput = passEl ? passEl.value.trim() : "";

  if (!usernameInput || !passwordInput) {
    alert("请输入存档名称与密码验证钥匙。");
    return;
  }

  const loaded = loadUserProfile(usernameInput);
  if (!loaded) {
    alert("未找到该名称的存档，请注册新存档。");
    return;
  }

  if (loaded.password !== passwordInput) {
    alert("密码验证钥匙不正确，无法载入存档。");
    return;
  }

  state.currentUser = usernameInput;
  state.userProfile = loaded;
  
  applyThemeColor(state.userProfile.calmingColor.h, state.userProfile.calmingColor.s, state.userProfile.calmingColor.l);
  switchView("home");
}

function handleLogout() {
  localStorage.removeItem(`tryrevive_active_user`);
  state.currentUser = "";
  switchView("login");
}

function applyThemeColor(h, s, l) {
  // Enforce extreme Morandi serene HSL constraints (saturation 8% - 18%, lightness 48% - 58%)
  const sereneS = Math.max(8, Math.min(s, 18));
  const sereneL = Math.max(48, Math.min(l, 58));

  document.documentElement.style.setProperty("--theme-h", h);
  document.documentElement.style.setProperty("--theme-s", `${sereneS}%`);
  document.documentElement.style.setProperty("--theme-l", `${sereneL}%`);
  
  // 6:3:1 Rule adjustments
  // 魂 (60%): Background (Deep Charcoal tinted with selected calming color)
  const bgGradStart = `hsl(${h}, ${sereneS * 0.2}%, 9%)`;
  const bgGradEnd = `hsl(${(h + 15) % 360}, ${sereneS * 0.1}%, 6%)`;
  document.documentElement.style.setProperty("--bg-gradient-start", bgGradStart);
  document.documentElement.style.setProperty("--bg-gradient-end", bgGradEnd);
  
  // 辅 (30%): card textures (Focuszen shallow charcoal)
  const glassBg = `hsla(${h}, ${sereneS * 0.25}%, 13%, 0.65)`;
  const glassBorder = `hsla(${h}, ${sereneS}%, 50%, 0.04)`;
  document.documentElement.style.setProperty("--surface-glass", glassBg);
  document.documentElement.style.setProperty("--surface-glass-border", glassBorder);
  
  // 点缀 (10%): Hue custom lightness
  const accent = `hsl(${h}, ${sereneS}%, ${sereneL}%)`;
  const accentLight = `hsl(${h}, ${sereneS}%, ${Math.min(sereneL + 5, 80)}%)`;
  const accentGlow = `hsla(${h}, ${sereneS}%, ${sereneL}%, 0.25)`;
  document.documentElement.style.setProperty("--accent", accent);
  document.documentElement.style.setProperty("--accent-light", accentLight);
  document.documentElement.style.setProperty("--accent-glow", accentGlow);
}

// --- 6. 自适应心理评测系统 (Quiz Engine with Q6 A/B visuals) ---
let currentQuestionIndex = 0;

function startQuiz() {
  currentQuestionIndex = 0;
  state.userProfile.quizAnswers = [];
  switchView("quiz");
  showQuestion();
}

function showQuestion() {
  const progressFill = document.getElementById("quiz-progress");
  const questionText = document.getElementById("quiz-question-text");
  const optionsBox = document.getElementById("quiz-options-box");

  const percent = (currentQuestionIndex / QUIZ_QUESTIONS.length) * 100;
  if (progressFill) progressFill.style.width = `${percent}%`;

  if (currentQuestionIndex >= QUIZ_QUESTIONS.length) {
    analyzeAnswers();
    switchView("onboarding");
    return;
  }

  const q = QUIZ_QUESTIONS[currentQuestionIndex];
  if (questionText) questionText.textContent = q.text;
  if (optionsBox) {
    optionsBox.innerHTML = "";
    
    // Check if Visual Card toggle question 6 (桌宠开启/隐藏)
    if (q.isVisualToggle) {
      const visualContainer = document.createElement("div");
      visualContainer.className = "quiz-visual-options";
      
      q.options.forEach(opt => {
        const card = document.createElement("div");
        card.className = "quiz-visual-card";
        
        const previewCanvas = document.createElement("canvas");
        previewCanvas.width = 75;
        previewCanvas.height = 75;
        previewCanvas.style.width = "75px";
        previewCanvas.style.height = "75px";
        
        card.appendChild(previewCanvas);
        
        const label = document.createElement("span");
        label.style.fontSize = "0.75rem";
        label.style.marginTop = "0.6rem";
        label.style.textAlign = "center";
        label.textContent = opt.text;
        card.appendChild(label);
        
        card.onclick = () => {
          state.userProfile.quizAnswers.push(opt.type);
          currentQuestionIndex++;
          showQuestion();
        };
        visualContainer.appendChild(card);
        
        // Render simple Preview Crayon Pet in Visual Cards
        setTimeout(() => {
          const ctx = previewCanvas.getContext("2d");
          if (opt.type === "Y") {
            // Draw cute walk chibi crayon
            ctx.filter = "blur(1.2px)";
            ctx.lineWidth = 10;
            ctx.strokeStyle = "rgba(240, 185, 185, 0.85)";
            ctx.fillStyle = "#ffffff";
            // Head
            ctx.beginPath();
            ctx.arc(37, 24, 13, 0, Math.PI * 2);
            ctx.fill();
            // Body line
            ctx.beginPath();
            ctx.moveTo(37, 36);
            ctx.lineTo(37, 56);
            ctx.stroke();
            ctx.filter = "none";
          } else {
            // Draw minimalist blank frame
            ctx.strokeStyle = "rgba(255,255,255,0.08)";
            ctx.lineWidth = 2;
            ctx.strokeRect(10, 10, 55, 55);
            ctx.font = "10px sans-serif";
            ctx.fillStyle = "rgba(255,255,255,0.3)";
            ctx.fillText("极简", 28, 41);
          }
        }, 50);
      });
      optionsBox.appendChild(visualContainer);
    } else {
      // Standard quiz options
      q.options.forEach(opt => {
        const btn = document.createElement("button");
        btn.className = "quiz-option-btn";
        btn.textContent = opt.text;
        btn.onclick = () => {
          state.userProfile.quizAnswers.push(opt.type);
          currentQuestionIndex++;
          showQuestion();
        };
        optionsBox.appendChild(btn);
      });
    }
  }
}

function skipQuiz() {
  analyzeAnswers();
  switchView("onboarding");
}

function analyzeAnswers() {
  const ans = state.userProfile.quizAnswers;
  
  let E_I = ans.includes("E") ? "E" : "I";
  let S_N = ans.includes("S") ? "S" : "N";
  let T_F = ans.includes("T") ? "T" : "F";
  let J_P = ans.includes("J") ? "J" : "P";
  
  let problem = "A"; // Default addiction
  if (ans.includes("D")) problem = "D";
  else if (ans.includes("V")) problem = "V";

  state.userProfile.mbti = `${E_I}${S_N}${T_F}${J_P}-${problem}`;
}

// --- 7. SVG 植物干花渐变色环与 HSL 滑轨无极微调 (Color Wreath) ---
const LEAF_PATHS = [
  "M 0,0 C 14,-8 22,-18 22,-32 C 22,-48 12,-58 0,-62 C -12,-58 -22,-48 -22,-32 C -22,-18 -14,-8 0,0",
  "M 0,0 C 12,-10 20,-20 20,-34 C 20,-46 10,-56 0,-62 C -10,-56 -20,-46 -20,-34 C -20,-20 -12,-10 0,0",
  "M 0,0 C 8,-12 14,-22 14,-34 C 14,-46 8,-54 0,-64 C -8,-54 -14,-46 -14,-34 C -14,-22 -8,-12 0,0",
  "M 0,0 C 7,-10 12,-20 12,-32 C 12,-44 7,-52 0,-60 C -7,-52 -12,-44 -12,-32 C -12,-20 -7,-10 0,0",
  "M 0,0 C 4,-6 10,-12 6,-18 C 12,-24 16,-34 10,-38 C 12,-44 6,-54 0,-64 C -6,-54 -12,-44 -10,-38 C -16,-34 -12,-24 -6,-18 C -10,-12 -4,-6 0,0",
  "M 0,0 C 3,-5 8,-10 5,-15 C 10,-20 13,-28 8,-32 C 10,-37 5,-45 0,-55 C -5,-45 -10,-37 -8,-32 C -13,-28 -10,-20 -5,-15 C -8,-10 -3,-5 0,0",
  "M 0,0 C 15,-5 20,-15 20,-28 C 20,-42 12,-52 0,-56 C -12,-52 -20,-42 -20,-28 C -20,-15 -15,-5 0,0",
  "M 0,0 C 13,-4 18,-13 18,-25 C 18,-38 11,-48 0,-52 C -11,-48 -18,-38 -18,-25 C -18,-13 -13,-4 0,0",
  "M 0,0 C 10,-6 16,-14 12,-22 C 22,-24 24,-34 14,-40 C 16,-48 8,-56 0,-64 C -8,-56 -16,-48 -14,-40 C -24,-34 -22,-24 -12,-22 C -16,-14 -10,-6 0,0",
  "M 0,0 C 8,-5 13,-11 10,-18 C 18,-20 20,-28 12,-33 C 13,-40 7,-47 0,-54 C -7,-47 -13,-40 -12,-33 C -20,-28 -18,-20 -10,-18 C -13,-11 -8,-5 0,0",
  "M 0,0 C 18,-6 20,-24 10,-38 C 14,-48 8,-58 0,-64 C -8,-58 -14,-48 -10,-38 C -20,-24 -18,-6 0,0",
  "M 0,0 C 16,-5 18,-22 9,-34 C 12,-44 7,-53 0,-58 C -7,-53 -12,-44 -9,-34 C -18,-22 -16,-5 0,0"
];

function renderColorWreath() {
  const wreath = document.getElementById("color-wreath");
  if (!wreath) return;

  const defs = wreath.querySelector("defs") || document.createElementNS("http://www.w3.org/2000/svg", "defs");
  if (!wreath.querySelector("defs")) wreath.appendChild(defs);
  defs.innerHTML = "";

  const oldLeaves = wreath.querySelectorAll(".leaf-node");
  oldLeaves.forEach(el => el.remove());

  const radius = 88;
  
  for (let i = 0; i < 12; i++) {
    const angle = i * 30;
    const angleRad = (angle - 90) * Math.PI / 180;
    const dx = Math.cos(angleRad) * 8;
    const dy = Math.sin(angleRad) * 8;

    // Define LinearGradients dynamically to add realistic plant leaf textures
    const gradId = `leaf-grad-${i}`;
    const grad = document.createElementNS("http://www.w3.org/2000/svg", "linearGradient");
    grad.setAttribute("id", gradId);
    grad.setAttribute("x1", "0%");
    grad.setAttribute("y1", "100%");
    grad.setAttribute("x2", "0%");
    grad.setAttribute("y2", "0%");
    
    // Dynamic stop nodes for gradient leaves
    const stop1 = document.createElementNS("http://www.w3.org/2000/svg", "stop");
    stop1.setAttribute("offset", "0%");
    stop1.setAttribute("stop-color", `hsl(${angle}, 55%, 35%)`);
    
    const stop2 = document.createElementNS("http://www.w3.org/2000/svg", "stop");
    stop2.setAttribute("offset", "100%");
    stop2.setAttribute("stop-color", `hsl(${angle}, 75%, 60%)`);
    
    grad.appendChild(stop1);
    grad.appendChild(stop2);
    defs.appendChild(grad);
    
    const leafColor = `url(#${gradId})`;
    const leafGlow = `hsla(${angle}, 65%, 55%, 0.65)`;
    const leafColorBorder = `hsla(${angle}, 65%, 55%, 0.25)`;

    const leafGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
    leafGroup.setAttribute("class", `leaf-node ${state.userProfile.calmingColor.h === angle ? "active" : ""}`);
    leafGroup.setAttribute("style", `--hover-dx: ${dx}px; --hover-dy: ${dy}px; --rotate-deg: ${angle}deg; --leaf-color: ${leafColor}; --leaf-color-border: ${leafColorBorder}; --leaf-glow: ${leafGlow}; transform: translate(${Math.cos(angleRad)*radius}px, ${Math.sin(angleRad)*radius}px) rotate(${angle}deg);`);
    leafGroup.dataset.hue = angle;

    const pathD = LEAF_PATHS[i];

    // Leaf outline
    const outerPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
    outerPath.setAttribute("d", pathD);
    outerPath.setAttribute("class", "leaf-path-outer");
    
    // Inner leaf core
    const innerPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
    innerPath.setAttribute("d", pathD);
    innerPath.setAttribute("class", "leaf-path-inner");
    innerPath.setAttribute("transform", "scale(0.82)");
    innerPath.setAttribute("fill", leafColor);

    // Multi-vein detailed layout (加入更多的纹路)
    const veinG = document.createElementNS("http://www.w3.org/2000/svg", "g");
    
    // Main central vein
    const mainVein = document.createElementNS("http://www.w3.org/2000/svg", "line");
    mainVein.setAttribute("x1", "0");
    mainVein.setAttribute("y1", "-2");
    mainVein.setAttribute("x2", "0");
    mainVein.setAttribute("y2", "-50");
    mainVein.setAttribute("class", "leaf-vein");
    veinG.appendChild(mainVein);

    // Secondary side veins (left & right detailed plant structures)
    for (let v = 1; v <= 3; v++) {
      const yPos = -12 * v;
      const leftVein = document.createElementNS("http://www.w3.org/2000/svg", "line");
      leftVein.setAttribute("x1", "0");
      leftVein.setAttribute("y1", yPos);
      leftVein.setAttribute("x2", "-8");
      leftVein.setAttribute("y2", yPos - 6);
      leftVein.setAttribute("class", "leaf-vein");
      leftVein.setAttribute("opacity", "0.4");
      
      const rightVein = document.createElementNS("http://www.w3.org/2000/svg", "line");
      rightVein.setAttribute("x1", "0");
      rightVein.setAttribute("y1", yPos);
      rightVein.setAttribute("x2", "8");
      rightVein.setAttribute("y2", yPos - 6);
      rightVein.setAttribute("class", "leaf-vein");
      rightVein.setAttribute("opacity", "0.4");

      veinG.appendChild(leftVein);
      veinG.appendChild(rightVein);
    }

    leafGroup.appendChild(outerPath);
    leafGroup.appendChild(innerPath);
    leafGroup.appendChild(veinG);

    // Click selects the theme color directly
    leafGroup.addEventListener("click", (e) => {
      e.stopPropagation();
      const activeLeaves = wreath.querySelectorAll(".leaf-node");
      activeLeaves.forEach(node => node.classList.remove("active"));
      leafGroup.classList.add("active");
      
      state.userProfile.calmingColor.h = angle;
      applyThemeColor(angle, state.userProfile.calmingColor.s, state.userProfile.calmingColor.l);
    });

    wreath.appendChild(leafGroup);
  }
}

function completeOnboarding() {
  const motivationInput = document.getElementById("input-motivation").value.trim();
  const customQuoteInput = document.getElementById("input-custom-quote").value.trim();
  const apiKeyInput = document.getElementById("input-api-key").value.trim();
  
  state.userProfile.motivation = motivationInput || "逃离算法洪流，自律重生。";
  state.userProfile.customQuote = customQuoteInput || "";
  state.userProfile.apiKey = apiKeyInput || "";
  

  // Write and auto-generate smart MBTI warning templates
  generateSmartMBTIQuote();
  
  localStorage.setItem(`tryrevive_save_${state.currentUser}`, JSON.stringify(state.userProfile));
  localStorage.setItem(`tryrevive_active_user`, state.currentUser);
  
  switchView("home");
}

// 自动匹配人格特质与梦想警醒语话术
function generateSmartMBTIQuote() {
  const mbti = state.userProfile.mbti;
  let traitKey = "FP"; // fallback
  if (mbti.includes("TJ")) traitKey = "TJ";
  else if (mbti.includes("FJ")) traitKey = "FJ";
  else if (mbti.includes("TP")) traitKey = "TP";
  
  const painKey = mbti.split("-")[1] || "A"; // Addiction/Delay/Vexation
  const list = MBTI_COACH_TEMPLATES[traitKey][painKey];
  
  // Select randomized template variant (概率随机展示)
  const index = Math.floor(Math.random() * list.length);
  const rawQuote = list[index];
  
  // Compile variables inside templates
  state.userProfile.motivation = state.userProfile.motivation || "专注当下，掌控自我";
  
  // Save pre-computed quote back to user profile
  state.userProfile.computedQuote = rawQuote;
}

// --- 8a. Creative Sprouting Plant Interaction on Narrative View ---
class SproutStem {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.currentLen = 0;
    this.targetLen = 22 + Math.random() * 38;
    this.ctrlX = (Math.random() - 0.5) * 30;
    this.ctrlY = -12 - Math.random() * 16;
    this.endX = (Math.random() - 0.5) * 45;
    this.endY = -28 - Math.random() * 24;
    this.leafSize = 4 + Math.random() * 5;
    this.state = 'growing'; // 'growing', 'swaying'
    this.flowerSpawned = Math.random() > 0.65;
    this.opacity = 1.0;
    this.age = 0;
    this.maxAge = 450 + Math.random() * 350; // Lives for ~8-12 seconds
  }
  
  update() {
    this.age++;
    if (this.state === 'growing') {
      this.currentLen += 1.4;
      if (this.currentLen >= this.targetLen) {
        this.state = 'swaying';
      }
    }
    if (this.age > this.maxAge) {
      this.opacity -= 0.015;
    }
  }
  
  draw(ctx, windAngle, windForce) {
    if (this.opacity <= 0) return;
    
    let ratio = this.state === 'growing' ? (this.currentLen / this.targetLen) : 1.0;
    let sx = this.endX;
    let sy = this.endY;
    if (this.state === 'swaying') {
      sx += Math.cos(windAngle) * windForce * 3.5;
    }
    
    ctx.save();
    ctx.globalAlpha = this.opacity;
    
    // Draw stem curves using Bezier
    ctx.beginPath();
    ctx.strokeStyle = 'rgba(74, 187, 124, 0.6)';
    ctx.lineWidth = 1.35;
    ctx.lineCap = 'round';
    
    let cx = this.x + this.ctrlX * ratio;
    let cy = this.y + this.ctrlY * ratio;
    let ex = this.x + sx * ratio;
    let ey = this.y + sy * ratio;
    
    ctx.moveTo(this.x, this.y);
    ctx.quadraticCurveTo(cx, cy, ex, ey);
    ctx.stroke();
    
    // Draw Leaf at the tip
    if (ratio >= 1.0) {
      ctx.save();
      ctx.translate(this.x + sx, this.y + ey);
      
      let leafRot = Math.sin(Date.now() * 0.0025 + this.x) * 0.15;
      ctx.rotate(leafRot);
      
      ctx.fillStyle = 'rgba(34, 197, 94, 0.85)';
      ctx.beginPath();
      ctx.ellipse(0, 0, this.leafSize * 1.35, this.leafSize * 0.7, 0, 0, Math.PI * 2);
      ctx.fill();
      
      if (this.flowerSpawned) {
        ctx.fillStyle = '#FBBF24'; // Golden flower
        ctx.beginPath();
        ctx.arc(0, -this.leafSize * 0.4, 2, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }
    
    ctx.restore();
  }
}

let sproutStems = [];
let sproutMouseBind = false;

function initNarrativeSproutCanvas() {
  const canvas = document.getElementById("narrative-sprout-canvas");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  sproutStems = [];
  
  const resizeCanvas = () => {
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
  };
  resizeCanvas();
  window.addEventListener("resize", resizeCanvas);

  const container = document.getElementById("view-narrative");
  if (container && !sproutMouseBind) {
    sproutMouseBind = true;
    container.addEventListener("mousemove", (e) => {
      if (state.activeView !== "narrative") return;
      
      // Check if mouse is hovering over a narrative paragraph
      const target = e.target;
      if (target && target.classList.contains("narrative-line")) {
        const rect = canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        
        // Prevent spawning too many overlapping stems
        if (Math.random() < 0.22) {
          let tooCluttered = false;
          sproutStems.forEach(s => {
            if (Math.sqrt((s.x - mouseX)**2 + (s.y - mouseY)**2) < 12) {
              tooCluttered = true;
            }
          });
          
          if (!tooCluttered && sproutStems.length < 120) {
            sproutStems.push(new SproutStem(mouseX, mouseY));
          }
        }
      }
    });
  }

  function animate() {
    if (state.activeView !== "narrative") return;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    let windAngle = Date.now() * 0.0025;
    let windForce = 0.6 + Math.sin(Date.now() * 0.001) * 0.3;
    
    // Update and draw stems
    for (let i = sproutStems.length - 1; i >= 0; i--) {
      const stem = sproutStems[i];
      stem.update();
      stem.draw(ctx, windAngle, windForce);
      if (stem.opacity <= 0) {
        sproutStems.splice(i, 1);
      }
    }
    
    state.canvasAnimIds.sprout = requestAnimationFrame(animate);
  }
  
  animate();
}

// --- 9. Canvas Galaxy Meditation Background Animation with Seed Core ---
function initGalaxyCanvas() {
  const canvas = document.getElementById("galaxy-canvas");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  
  const resizeCanvas = () => {
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
  };
  resizeCanvas();

  const starCount = 65;
  const stars = [];
  const meteors = [];
  
  const calmingH = state.userProfile.calmingColor.h;
  const calmingS = state.userProfile.calmingColor.s;
  
  for (let i = 0; i < starCount; i++) {
    stars.push({
      x: Math.random(),
      y: Math.random(),
      size: 0.6 + Math.random() * 1.5,
      pulseSpeed: 0.01 + Math.random() * 0.03,
      phase: Math.random() * Math.PI * 2,
      hOffset: (Math.random() - 0.5) * 30
    });
  }

  function spawnMeteor() {
    meteors.push({
      x: -0.1 + Math.random() * 0.6,
      y: -0.1 + Math.random() * 0.4,
      length: 80 + Math.random() * 120,
      angle: Math.PI / 6 + (Math.random() - 0.5) * 0.05,
      speed: 3 + Math.random() * 4,
      opacity: 0.7 + Math.random() * 0.3,
      width: 1.2 + Math.random() * 1.5
    });
  }

  let globalTime = 0;
  let currentBreathScale = 1.0;

  function animate() {
    if (state.activeView !== "meditation") return;

    const width = canvas.width / (window.devicePixelRatio || 1);
    const height = canvas.height / (window.devicePixelRatio || 1);

    globalTime += 0.012;

    const gradient = ctx.createRadialGradient(
      width / 2, height / 2, 10,
      width / 2, height / 2, Math.max(width, height) * 0.8
    );
    
    const progress = 1.0 - (state.timeLeft / state.meditationTotalTime);
    
    const baseH = calmingH;
    const baseS = Math.round(calmingS * (0.15 + 0.35 * progress));
    const baseL = Math.round(3 + 5 * progress);
    
    const bgStart = `hsl(${baseH}, ${baseS}%, ${baseL}%)`;
    const bgMid = `hsl(${(baseH + 15) % 360}, ${baseS * 0.8}%, ${baseL - 1}%)`;
    const bgEnd = `hsl(${(baseH + 40) % 360}, ${baseS * 0.5}%, 1%)`;
    
    gradient.addColorStop(0, bgStart);
    gradient.addColorStop(0.5, bgMid);
    gradient.addColorStop(1, bgEnd);
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // ----------------------------------------------------
    // Draw the Organic Breathing "Seed Core" membranes in the center
    // Pulsate target matches the current breathing phase scale
    let targetScale = 1.0;
    if (breathPhase === "inhale" || breathPhase === "holdIn") {
      targetScale = 1.48;
    } else {
      targetScale = 0.88;
    }
    // Smooth ease out interpolation
    currentBreathScale += (targetScale - currentBreathScale) * 0.038;

    const centerX = width / 2;
    const centerY = height / 2;
    // Base radius of the core
    let baseR = 64 * currentBreathScale;
    let layersCount = 3;

    for (let l = 0; l < layersCount; l++) {
      let alpha = 0.075 - l * 0.022;
      let scaleFactor = 1.0 + l * 0.28;
      let rad = baseR * scaleFactor;
      
      ctx.fillStyle = `hsla(${calmingH}, ${calmingS}%, ${state.userProfile.calmingColor.l}%, ${alpha})`;
      ctx.beginPath();
      
      const steps = 72;
      for (let sIdx = 0; sIdx <= steps; sIdx++) {
        let angle = (sIdx / steps) * Math.PI * 2;
        // Deterministic pseudo-noise for smooth organic undulating shape
        let wave = Math.sin(angle * 3 + globalTime * 1.3) * 0.12
                 + Math.cos(angle * 5 - globalTime * 0.7) * 0.06
                 + Math.sin(angle * 7 + globalTime * 2.1) * 0.03;
        let r = rad * (1.0 + wave);
        let px = centerX + r * Math.cos(angle);
        let py = centerY + r * Math.sin(angle);
        if (sIdx === 0) {
          ctx.moveTo(px, py);
        } else {
          ctx.lineTo(px, py);
        }
      }
      ctx.closePath();
      ctx.fill();
    }
    // ----------------------------------------------------

    for (let i = 0; i < stars.length; i++) {
      const star = stars[i];
      star.phase += star.pulseSpeed * (1.0 + progress * 0.5);
      const alpha = (0.2 + 0.2 * progress) + (Math.sin(star.phase) + 1) * (0.25 + 0.15 * progress);
      
      const starH = baseH + star.hOffset;
      ctx.fillStyle = `hsla(${starH}, ${calmingS}%, 90%, ${alpha})`;
      ctx.beginPath();
      ctx.arc(star.x * width, star.y * height, star.size, 0, Math.PI * 2);
      ctx.fill();
    }

    if (Math.random() < 0.006 + progress * 0.006 && meteors.length < 3) {
      spawnMeteor();
    }

    for (let i = meteors.length - 1; i >= 0; i--) {
      const m = meteors[i];
      const dx = Math.cos(m.angle) * m.speed;
      const dy = Math.sin(m.angle) * m.speed;
      m.x += dx / width;
      m.y += dy / height;
      m.opacity -= 0.005;

      const screenX = m.x * width;
      const screenY = m.y * height;
      const tailX = screenX - Math.cos(m.angle) * m.length;
      const tailY = screenY - Math.sin(m.angle) * m.length;
      
      const mGradient = ctx.createLinearGradient(screenX, screenY, tailX, tailY);
      mGradient.addColorStop(0, `rgba(255, 255, 255, ${m.opacity})`);
      mGradient.addColorStop(0.3, `hsla(${baseH}, ${calmingS}%, 75%, ${m.opacity * 0.7})`);
      mGradient.addColorStop(1, `hsla(${(baseH + 30) % 360}, ${calmingS}%, 45%, 0)`);
      
      ctx.strokeStyle = mGradient;
      ctx.lineWidth = m.width;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(screenX, screenY);
      ctx.lineTo(tailX, tailY);
      ctx.stroke();

      if (m.opacity <= 0 || m.x > 1.2 || m.y > 1.2) {
        meteors.splice(i, 1);
      }
    }

    state.canvasAnimIds.galaxy = requestAnimationFrame(animate);
  }

  animate();
}

// --- 10. Canvas Irregular Watercolor Cloud Bubble Animation (不规则云雾气泡) ---
const cloudBubbles = [];

function initCloudBubbleCanvas() {
  const canvas = document.getElementById("cloud-bubble-canvas");
  if (!canvas) return;
  
  const ctx = canvas.getContext("2d");
  
  const resize = () => {
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
  };
  resize();
  window.addEventListener("resize", resize);
  
  // Initialize cloud particles (3 clouds drifting)
  cloudBubbles.length = 0;
  for (let i = 0; i < 4; i++) {
    cloudBubbles.push({
      x: Math.random() * canvas.width,
      y: canvas.height + 50 + Math.random() * 100,
      vy: -0.4 - Math.random() * 0.5,
      baseRadius: 60 + Math.random() * 40,
      phase: Math.random() * Math.PI * 2,
      phaseSpeed: 0.005 + Math.random() * 0.005,
      points: 8, // 8-point morphing polygon
      radiusOffsets: Array.from({ length: 8 }, () => (Math.random() - 0.5) * 15)
    });
  }
  
  function drawCloud(c) {
    const pointsCount = c.points;
    const angleStep = (Math.PI * 2) / pointsCount;
    
    ctx.save();
    
    // High blur for realistic misty watercolor texture
    ctx.filter = "blur(24px)";
    
    const h = state.userProfile.calmingColor.h;
    const s = state.userProfile.calmingColor.s || 65;
    const l = state.userProfile.calmingColor.l || 55;
    
    // Create soft radial watercolor gradient (Fluffy white cloud tinted with calming color)
    const grad = ctx.createRadialGradient(c.x, c.y, 5, c.x, c.y, c.baseRadius * 1.6);
    
    grad.addColorStop(0, `hsla(${h}, ${Math.min(15, s * 0.2)}%, 98%, 0.24)`); // Fluffy cloud white core
    grad.addColorStop(0.4, `hsla(${h}, ${s * 0.4}%, ${l}%, 0.08)`); // Calm color halo tint
    grad.addColorStop(1, "transparent");
    
    ctx.fillStyle = grad;
    ctx.beginPath();
    
    // Draw morphing bezier loop
    const points = [];
    for (let i = 0; i < pointsCount; i++) {
      const angle = i * angleStep;
      // Morphing radial distance using sinus modulation
      const radius = c.baseRadius + c.radiusOffsets[i] + Math.sin(c.phase + i) * 6;
      points.push({
        x: c.x + Math.cos(angle) * radius,
        y: c.y + Math.sin(angle) * radius
      });
    }
    
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 0; i < pointsCount; i++) {
      const nextIdx = (i + 1) % pointsCount;
      const xc = (points[i].x + points[nextIdx].x) / 2;
      const yc = (points[i].y + points[nextIdx].y) / 2;
      ctx.quadraticCurveTo(points[i].x, points[i].y, xc, yc);
    }
    
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }
  
  function animate() {
    if (state.activeView !== "meditation") return;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    cloudBubbles.forEach(c => {
      c.y += c.vy;
      c.phase += c.phaseSpeed;
      
      // Loop back to bottom
      if (c.y < -150) {
        c.y = canvas.height + 150;
        c.x = Math.random() * canvas.width;
      }
      
      drawCloud(c);
    });
    
    state.canvasAnimIds.cloudBubble = requestAnimationFrame(animate);
  }
  
  animate();
}

// --- 11. Breathing Sanctuary Cycle Control ---
let breathPhase = "inhale";
let breathTimer = 0;
let breathInterval = null;

function runBreathingSanctuary() {
  const breathCircle = document.getElementById("breath-circle-inner");
  const breathingLabel = document.getElementById("breathing-label");
  if (!breathCircle || !breathingLabel) return;

  function updateBreathLoop() {
    if (state.activeView !== "meditation") return;

    // Sync thought loop with breathing phases
    updateZenThoughtState(breathPhase, breathTimer);

    if (breathPhase === "inhale") {
      breathCircle.style.transform = "scale(1.55)";
      breathingLabel.textContent = "吸气… 吸入宁静与专注";
      modulateWaves("inhale");
      breathTimer++;
      if (breathTimer >= 4) {
        breathPhase = "holdIn";
        breathTimer = 0;
      }
    } else if (breathPhase === "holdIn") {
      breathingLabel.textContent = "屏息… 锁定内心的平静";
      breathTimer++;
      if (breathTimer >= 4) {
        breathPhase = "exhale";
        breathTimer = 0;
      }
    } else if (breathPhase === "exhale") {
      breathCircle.style.transform = "scale(0.85)";
      breathingLabel.textContent = "呼气… 释放焦躁与拖延";
      modulateWaves("exhale");
      breathTimer++;
      if (breathTimer >= 4) {
        breathPhase = "holdOut";
        breathTimer = 0;
      }
    } else if (breathPhase === "holdOut") {
      breathingLabel.textContent = "屏息… 准备下一次呼吸";
      breathTimer++;
      if (breathTimer >= 4) {
        breathPhase = "inhale";
        breathTimer = 0;
      }
    }
  }

  breathPhase = "inhale";
  breathTimer = 0;
  if (breathInterval) clearInterval(breathInterval);
  breathInterval = setInterval(updateBreathLoop, 1000);
}

// --- 12. Zen-Breathing Thought Loop controller (一吸一呼念头起落循环) ---
function updateZenThoughtState(phase, timer) {
  const thoughtTextEl = document.getElementById("zen-thought-text");
  if (!thoughtTextEl) return;

  if (phase === "inhale") {
    if (timer === 0) {
      const pool = [...BUBBLE_TEXTS];
      if (state.userProfile.customQuote) {
        pool.push(state.userProfile.customQuote);
      }
      if (state.userProfile.motivation) {
        pool.push(`终极梦想规划：${state.userProfile.motivation}`);
      }

      let selectedText = pool[0];
      if (pool.length > 1) {
        let attempts = 0;
        do {
          selectedText = pool[Math.floor(Math.random() * pool.length)];
          attempts++;
        } while (selectedText === thoughtTextEl.textContent && attempts < 10);
      }

      thoughtTextEl.textContent = selectedText;
      thoughtTextEl.classList.add("visible");
    }
  } else if (phase === "holdIn") {
    thoughtTextEl.classList.add("visible");
  } else if (phase === "exhale") {
    if (timer === 0) {
      thoughtTextEl.classList.remove("visible");
    }
  } else if (phase === "holdOut") {
    thoughtTextEl.classList.remove("visible");
  }
}

// --- 13. Meditation Timer Controller ---
function startMeditationSession(durationSeconds) {
  const setupOverlay = document.getElementById("meditation-setup-overlay");
  const setupInput = document.getElementById("meditation-setup-quote");
  
  if (setupInput) {
    state.userProfile.customQuote = setupInput.value.trim();
    localStorage.setItem(`tryrevive_save_${state.currentUser}`, JSON.stringify(state.userProfile));
  }
  
  if (setupOverlay) setupOverlay.style.display = "none";
  
  state.meditationActive = true;
  state.meditationTotalTime = durationSeconds;
  state.timeLeft = durationSeconds;
  
  updateTimerDisplay();
  
  setAvatarState("gray");
  
  state.timerInterval = setInterval(() => {
    state.timeLeft--;
    updateTimerDisplay();

    if (state.timeLeft <= 0) {
      clearInterval(state.timerInterval);
      state.timerInterval = null;
      showWakeupModal();
    }
  }, 1000);

  initGalaxyCanvas();
  initCloudBubbleCanvas();
  runBreathingSanctuary();
  updateZenThoughtState("inhale", 0); // Trigger initial thought immediately
  startOceanWaves();
}

function updateTimerDisplay() {
  const timerEl = document.getElementById("meditation-timer");
  if (!timerEl) return;
  const minutes = Math.floor(state.timeLeft / 60);
  const seconds = state.timeLeft % 60;
  timerEl.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

function showWakeupModal() {
  const modal = document.getElementById("wakeup-dialog");
  const motivationTextEl = document.getElementById("wakeup-motivation-text");
  
  if (motivationTextEl) {
    motivationTextEl.textContent = "🔍 AI 正在生成你的禅想自省心语...";
  }
  if (modal) modal.classList.add("active");
  stopOceanWaves();

  fetchAICoachFeedback("meditation_complete", (text) => {
    if (motivationTextEl) {
      motivationTextEl.textContent = text;
    }
  });
}

function closeWakeupModal() {
  const modal = document.getElementById("wakeup-dialog");
  if (modal) modal.classList.remove("active");
  
  if (state.currentUser && state.userProfile) {
    if (!state.userProfile.meditationCount) {
      state.userProfile.meditationCount = 0;
    }
    state.userProfile.meditationCount++;
    localStorage.setItem(`tryrevive_save_${state.currentUser}`, JSON.stringify(state.userProfile));
  }

  setAvatarState("white");
  if (typeof updateTopologyValues === "function") {
    updateTopologyValues();
  }

  switchView("home");
}

function exitMeditationCleanly() {
  if (state.timerInterval) clearInterval(state.timerInterval);
  if (breathInterval) clearInterval(breathInterval);
  if (bubbleInterval) clearInterval(bubbleInterval);
  stopOceanWaves();
  
  const setupOverlay = document.getElementById("meditation-setup-overlay");
  if (setupOverlay) setupOverlay.style.display = "none";
  
  switchView("home");
}

function askUserStatusDuringHealing() {
  const feeling = prompt("你现在感觉怎么样？输入数字:\n1. 依然浮躁\n2. 渐入佳境\n3. 豁然开朗");
  if (feeling === "1") {
    setAvatarState("black");
  } else if (feeling === "2") {
    setAvatarState("gray");
  } else if (feeling === "3") {
    setAvatarState("white");
  }
}

// --- 14. 0-1 Goal Coach Popup Controls ---
function applyGoalSuggestion(text) {
  const goalInput = document.getElementById("goal-first-step-input");
  if (goalInput) {
    goalInput.value = text;
    state.userProfile.firstStep = text;
    localStorage.setItem(`tryrevive_save_${state.currentUser}`, JSON.stringify(state.userProfile));
  }
}

// --- 15. Narrative Easing Intro Control ---
const NARRATIVE_LINES = [
  "narrative-1", "narrative-2", "narrative-3",
  "narrative-4", "narrative-5", "narrative-6", "narrative-7"
];
let narrativeTimeout = null;

function runNarrativeIntro() {
  let lineIdx = 0;
  
  function showNextLine() {
    if (state.activeView !== "narrative") return;
    
    if (lineIdx >= NARRATIVE_LINES.length) {
      const footer = document.getElementById("narrative-footer");
      if (footer) footer.style.opacity = "1";
      return;
    }

    const lineId = NARRATIVE_LINES[lineIdx];
    const el = document.getElementById(lineId);
    if (el) {
      el.classList.add("visible");
      el.classList.add("typing-cursor");
    }

    if (lineIdx > 0) {
      const prevEl = document.getElementById(NARRATIVE_LINES[lineIdx - 1]);
      if (prevEl) prevEl.classList.remove("typing-cursor");
    }

    const duration = lineIdx % 2 === 0 ? 2500 : 1500;
    lineIdx++;
    
    narrativeTimeout = setTimeout(showNextLine, duration);
  }

  showNextLine();
}

function skipNarrative() {
  if (narrativeTimeout) clearTimeout(narrativeTimeout);
  
  NARRATIVE_LINES.forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.classList.remove("typing-cursor");
      el.classList.add("visible");
    }
  });

  switchView("login");
}

// --- 16. Custom App Dock Grid Management (一键增删与左右移位) ---
function renderAppDock() {
  const grid = document.getElementById("app-dock-grid");
  if (!grid) return;
  
  grid.innerHTML = "";
  
  state.userProfile.appDock.forEach((app, idx) => {
    const item = document.createElement("div");
    item.className = `dock-app-item ${state.dockEditMode ? "edit-mode" : ""}`;
    
    // Get app initials for visual text icon
    const initials = app.name.slice(0, 2);
    
    item.innerHTML = `
      <div class="dock-app-delete-btn" onclick="deleteDockApp('${app.id}'); event.stopPropagation();">✕</div>
      <div class="dock-app-icon">
        ${initials}
      </div>
      <div class="dock-app-label">${app.name}</div>
      <div class="dock-app-nav-btns">
        <div class="dock-nav-btn" onclick="moveDockApp('${app.id}', -1); event.stopPropagation();">←</div>
        <div class="dock-nav-btn" onclick="moveDockApp('${app.id}', 1); event.stopPropagation();">→</div>
      </div>
    `;
    
    // Normal redirect click
    item.onclick = () => {
      if (state.dockEditMode) return;
      triggerShortcutRedirect(app.name, app.url);
    };
    
    grid.appendChild(item);
  });
  
  // Plus Add Custom App icon at the end
  const plusItem = document.createElement("div");
  plusItem.className = "dock-app-item";
  plusItem.innerHTML = `
    <div class="dock-app-icon" style="background: rgba(255,255,255,0.03); border-style: dashed; border-color: rgba(255,255,255,0.15);">
      ➕
    </div>
    <div class="dock-app-label" style="color: var(--accent);">添加</div>
  `;
  plusItem.onclick = () => {
    if (state.dockEditMode) return;
    document.getElementById("add-app-modal").classList.add("active");
  };
  grid.appendChild(plusItem);
}

function toggleDockEditMode() {
  state.dockEditMode = !state.dockEditMode;
  const editBtn = document.getElementById("edit-dock-btn");
  if (editBtn) {
    editBtn.innerHTML = state.dockEditMode ? "<span>💾 保存退出</span>" : "<span>✏️ 编辑管理</span>";
  }
  renderAppDock();
  
  // Save state if saved exit
  if (!state.dockEditMode) {
    localStorage.setItem(`tryrevive_save_${state.currentUser}`, JSON.stringify(state.userProfile));
  }
}

function deleteDockApp(id) {
  state.userProfile.appDock = state.userProfile.appDock.filter(app => app.id !== id);
  renderAppDock();
}

function moveDockApp(id, direction) {
  const list = state.userProfile.appDock;
  const index = list.findIndex(app => app.id === id);
  if (index === -1) return;
  
  const targetIndex = index + direction;
  if (targetIndex < 0 || targetIndex >= list.length) return;
  
  // Swap indices
  const temp = list[index];
  list[index] = list[targetIndex];
  list[targetIndex] = temp;
  
  renderAppDock();
}

function fillPresetApp(name, url) {
  const nameInput = document.getElementById("custom-app-name");
  const urlInput = document.getElementById("custom-app-url");
  if (nameInput) nameInput.value = name;
  if (urlInput) urlInput.value = url;
}

function saveCustomApp() {
  const nameInput = document.getElementById("custom-app-name");
  const urlInput = document.getElementById("custom-app-url");
  
  if (!nameInput || !urlInput) return;
  
  const name = nameInput.value.trim();
  let url = urlInput.value.trim();
  
  if (!name || !url) {
    alert("请输入名称和有效网址。");
    return;
  }
  
  if (!url.startsWith("http")) {
    url = "https://" + url;
  }
  
  const newId = `custom_${Date.now()}`;
  
  // Generate random pleasant theme color stop
  const randomHue = Math.floor(Math.random() * 360);
  const color = `hsl(${randomHue}, 65%, 45%)`;
  
  state.userProfile.appDock.push({
    id: newId,
    name,
    url,
    color
  });
  
  // Clear fields and close
  nameInput.value = "";
  urlInput.value = "";
  document.getElementById("add-app-modal").classList.remove("active");
  
  // Save profile and reload DOCK
  localStorage.setItem(`tryrevive_save_${state.currentUser}`, JSON.stringify(state.userProfile));
  renderAppDock();
}

// --- 17. Dual-Loop Blocker (Link Interception & Time Limits) ---
function triggerShortcutRedirect(siteName, targetUrl) {
  state.blockerTargetSite = siteName;
  state.blockerTargetUrl = targetUrl;
  
  const modal = document.getElementById("link-intercept-modal");
  const siteNameEl = document.getElementById("intercept-site-name");
  if (siteNameEl) siteNameEl.textContent = siteName;
  
  const step2Input = document.getElementById("intercept-step2");
  const step3Input = document.getElementById("intercept-step3");
  if (step2Input) step2Input.value = state.userProfile.step2 || "";
  if (step3Input) step3Input.value = state.userProfile.step3 || "";
  
  if (modal) modal.classList.add("active");
}

function cancelRedirect() {
  const modal = document.getElementById("link-intercept-modal");
  if (modal) modal.classList.remove("active");
}

function confirmRedirect() {
  const selectEl = document.getElementById("intercept-duration");
  const step2Input = document.getElementById("intercept-step2");
  const step3Input = document.getElementById("intercept-step3");
  
  const minutes = selectEl ? parseInt(selectEl.value, 10) : 10;
  
  state.userProfile.step2 = step2Input ? step2Input.value.trim() : "";
  state.userProfile.step3 = step3Input ? step3Input.value.trim() : "";
  
  localStorage.setItem(`tryrevive_save_${state.currentUser}`, JSON.stringify(state.userProfile));
  
  state.blockerTimeLimitSec = minutes * 60;
  state.blockerStartTime = Date.now();
  state.blockerTimerActive = true;
  
  cancelRedirect();
  
  // Open target in new tab
  window.open(state.blockerTargetUrl, "_blank");
  
  setAvatarState("black");
  
  // Update UI steps
  const stepsDisplay = document.getElementById("goal-plan-steps-display");
  const step2El = document.getElementById("display-step-2");
  const step3El = document.getElementById("display-step-3");
  if (stepsDisplay) stepsDisplay.style.display = "block";
  if (step2El) step2El.textContent = state.userProfile.step2 || "未计划";
  if (step3El) step3El.textContent = state.userProfile.step3 || "未计划";
  
  // Save pre-computed smart warnings quotes instantly (Bugfix: pre-generate warning quotes)
  generateSmartMBTIQuote();
  localStorage.setItem(`tryrevive_save_${state.currentUser}`, JSON.stringify(state.userProfile));
  
  if (state.blockerInterval) clearInterval(state.blockerInterval);
  state.blockerInterval = setInterval(checkBlockerCountdown, 1000);
}

function checkBlockerCountdown() {
  if (!state.blockerTimerActive) {
    clearInterval(state.blockerInterval);
    return;
  }
  
  const elapsedSec = Math.floor((Date.now() - state.blockerStartTime) / 1000);
  const timeLeftSec = state.blockerTimeLimitSec - elapsedSec;
  
  if (timeLeftSec <= 0) {
    document.title = `⏰【超时】${Math.abs(Math.floor(timeLeftSec / 60))}分${Math.abs(timeLeftSec % 60)}秒!`;
    if (!heartbeatInterval) {
      startHeartbeatLoop();
    }
  } else {
    const min = Math.floor(timeLeftSec / 60);
    const sec = timeLeftSec % 60;
    document.title = `⏳【限时浏览】：${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  }
}

function extendFocusTimer(seconds) {
  if (state.blockerTimerActive) {
    state.blockerTimeLimitSec += seconds;
    stopHeartbeatLoop();
    if (typeof stopTitleBlinking === "function") {
      stopTitleBlinking();
    }
    document.title = "Tryrevive - 夺回你的注意力主权";
    
    const overlay = document.getElementById("alert-blocking");
    if (overlay) overlay.classList.remove("active");
  }
}

function enterMeditationFromBlocker() {
  const overlay = document.getElementById("alert-blocking");
  if (overlay) overlay.classList.remove("active");
  
  stopHeartbeatLoop();
  if (typeof stopTitleBlinking === "function") {
    stopTitleBlinking();
  }
  document.title = "Tryrevive - 夺回你的注意力主权";
  
  state.blockerTimerActive = false;
  if (state.blockerInterval) clearInterval(state.blockerInterval);
  
  switchView("meditation");
}

function initFocusMonitor() {
  window.addEventListener("focus", () => {
    if (state.blockerTimerActive) {
      const elapsedSec = Math.floor((Date.now() - state.blockerStartTime) / 1000);
      const isOvertime = elapsedSec > state.blockerTimeLimitSec;
      
      if (isOvertime) {
        triggerBlockerWarning(elapsedSec - state.blockerTimeLimitSec);
      }
    }
  });
}

// 解决偏好更新无法渲染的 Bug
function compileQuoteText(rawText) {
  if (!rawText) return "";
  return rawText
    .replace(/{motivation}/g, state.userProfile.motivation || "专注当下")
    .replace(/{step2}/g, state.userProfile.step2 || "第二步计划")
    .replace(/{step3}/g, state.userProfile.step3 || "第三步计划")
    .replace(/{hours}/g, "1.5");
}

function syncWarningMotivationalDOM() {
  const goalInput = document.getElementById("goal-first-step-input");
  if (goalInput) goalInput.value = state.userProfile.firstStep || "";
  
  const stepsDisplay = document.getElementById("goal-plan-steps-display");
  const step2El = document.getElementById("display-step-2");
  const step3El = document.getElementById("display-step-3");
  
  if (state.userProfile.step2 || state.userProfile.step3) {
    if (stepsDisplay) stepsDisplay.style.display = "block";
    if (step2El) step2El.textContent = state.userProfile.step2 || "未计划";
    if (step3El) step3El.textContent = state.userProfile.step3 || "未计划";
  } else {
    if (stepsDisplay) stepsDisplay.style.display = "none";
  }

  // Update homepage welcome subtitle
  const mbtiLabel = document.getElementById("dashboard-mbti-label");
  if (mbtiLabel) {
    // If user has a custom quote, use it. Otherwise, use computed MBTI warning quote.
    let rawText = state.userProfile.customQuote;
    if (!rawText) {
      generateSmartMBTIQuote();
      rawText = state.userProfile.computedQuote || "即搜即达，心无旁骛";
    }
    const compiled = compileQuoteText(rawText);
    mbtiLabel.textContent = `“${compiled}”`;
  }

  // Update reborn warning banner title
  const rebornTitle = document.getElementById("reborn-banner-title-text") || document.querySelector(".reborn-banner-title");
  if (rebornTitle) {
    rebornTitle.textContent = state.userProfile.motivation || "重新掌控自己的人生";
  }
  
  if (typeof updateTopologyValues === "function") {
    updateTopologyValues();
  }
}

// --- 17a. Anthropic API AI Coach Client logic ---
async function fetchAICoachFeedback(promptType, callback) {
  const apiKey = state.userProfile.apiKey;
  if (!apiKey) {
    console.log("No Anthropic API Key configured. Falling back to local MBTI coach templates.");
    callback(getLocalFallbackQuote(promptType));
    return;
  }

  const systemPrompt = "你是一个极其深刻犀利的自律教练，擅长给沉迷于网络推荐流、拖延人生的用户一记当头棒喝。请根据用户的 MBTI 人格类型、今日终极梦想目标，以及他们目前偏离计划的现状，生成一句话，作为自控力警示或禅修自省。字数限制在 50 字以内。要求语气极其克制、深邃，有物理摩擦力，剔除所有AI套话（如：综上所述、不得不说、让我们开始等）。直接输出内容。";
  const userMessage = `
  用户 MBTI: ${state.userProfile.mbti}
  今日终极目标: ${state.userProfile.motivation}
  当前步骤计划: 1. ${state.userProfile.firstStep || "未设定"} | 2. ${state.userProfile.step2 || "未设定"} | 3. ${state.userProfile.step3 || "未设定"}
  触发情境: ${promptType === "blocker" ? "用户在使用被设防的应用超时，需要警醒防线" : "用户刚完成一轮禅想冷静，准备重新上路自律"}
  `;

  // Check if inside Chrome Extension worker proxy context
  if (window.chrome && chrome.runtime && chrome.runtime.sendMessage) {
    chrome.runtime.sendMessage(
      {
        action: "fetchAnthropic",
        apiKey: apiKey,
        system: systemPrompt,
        message: userMessage
      },
      (response) => {
        if (response && response.success) {
          callback(response.content.trim());
        } else {
          console.error("Chrome Extension proxy error:", response ? response.error : "Unknown");
          callback(getLocalFallbackQuote(promptType));
        }
      }
    );
  } else {
    // Web direct fetch fallback (will trigger CORS unless dangerous access is allowed or running locally with bypass)
    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
          "content-type": "application/json",
          "anthropic-dangerous-direct-access-allowed": "true"
        },
        body: JSON.stringify({
          model: "claude-3-5-sonnet-20241022",
          max_tokens: 120,
          system: systemPrompt,
          messages: [{ role: "user", content: userMessage }]
        })
      });
      
      if (!response.ok) throw new Error(`HTTP status ${response.status}`);
      const data = await response.json();
      if (data && data.content && data.content[0] && data.content[0].text) {
        callback(data.content[0].text.trim());
      } else {
        throw new Error("Invalid Anthropic API response format");
      }
    } catch (err) {
      console.warn("Direct Anthropic API fetch failed (likely CORS). Falling back. Error:", err.message);
      callback(getLocalFallbackQuote(promptType));
    }
  }
}

function getLocalFallbackQuote(promptType) {
  generateSmartMBTIQuote();
  let rawText = state.userProfile.computedQuote || "继续沉溺在低信息熵的算法中，你距离梦想的物理偏差正不断扩大。";
  return rawText
    .replace("{motivation}", state.userProfile.motivation)
    .replace("{step2}", state.userProfile.step2 || "第二步计划")
    .replace("{step3}", state.userProfile.step3 || "第三步计划");
}

function triggerBlockerWarning(overtimeSeconds) {
  const overlay = document.getElementById("alert-blocking");
  const title = document.querySelector(".blocking-warning-title");
  const text = document.getElementById("blocking-warning-text");
  const quote = document.getElementById("blocking-mbti-quote");

  if (title) title.textContent = `⚠️ Tryrevive / 专注防线偏差警告`;
  if (text) text.innerHTML = "🔍 AI 自律教练正在透视分析你的防线偏差状态...";
  if (quote) quote.innerHTML = `"${state.userProfile.motivation}"`;
  
  if (overlay) overlay.classList.add("active");
  startHeartbeatLoop();
  setAvatarState("black");
  
  if (state.currentUser && state.userProfile) {
    if (!state.userProfile.timeoutCount) {
      state.userProfile.timeoutCount = 0;
    }
    state.userProfile.timeoutCount++;
    localStorage.setItem(`tryrevive_save_${state.currentUser}`, JSON.stringify(state.userProfile));
  }
  
  if (typeof startTitleBlinking === "function") {
    startTitleBlinking();
  }

  fetchAICoachFeedback("blocker", (textVal) => {
    if (text) text.innerHTML = textVal;
  });
}

// --- 18. Initial Boot Up & DOM Events binding ---
document.addEventListener("DOMContentLoaded", () => {
  const goalStepInput = document.getElementById("goal-first-step-input");
  if (goalStepInput) {
    goalStepInput.addEventListener("change", () => {
      state.userProfile.firstStep = goalStepInput.value.trim();
      localStorage.setItem(`tryrevive_save_${state.currentUser}`, JSON.stringify(state.userProfile));
    });
  }

  const searchInput = document.getElementById("home-search-input");
  if (searchInput) {
    searchInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        const query = searchInput.value.trim();
        if (!query) return;
        searchInput.value = "";

        let url = query;
        let siteName = "外部网址";
        if (query.match(/^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/)) {
          if (!query.startsWith("http")) url = "https://" + query;
          siteName = query.split('/')[0].replace('www.', '');
        } else {
          url = `https://duckduckgo.com/?q=${encodeURIComponent(query)}`;
          siteName = "搜索网页";
        }
        
        triggerShortcutRedirect(siteName, url);
      }
    });
  }

  // Bind Control Console states (mini-console)
  const avatarButtons = document.querySelectorAll("[data-avatar-set]");
  avatarButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      avatarButtons.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      setAvatarState(btn.dataset.avatarSet);
    });
  });

  // Check active logins safely
  const activeUser = localStorage.getItem("tryrevive_active_user");
  if (activeUser) {
    const loaded = loadUserProfile(activeUser);
    if (loaded) {
      state.currentUser = activeUser;
      state.userProfile = loaded;
      applyThemeColor(state.userProfile.calmingColor.h, state.userProfile.calmingColor.s, state.userProfile.calmingColor.l);
      switchView("home");
    } else {
      switchView("narrative");
      runNarrativeIntro();
    }
  } else {
    switchView("narrative");
    runNarrativeIntro();
  }

  initFocusMonitor();
  if (typeof initTopologyGraph === "function") {
    initTopologyGraph();
  }
});

function setAvatarState(stateName) {
  state.avatarState = stateName;
  
  if (stateName === "black") state.avatarAction = "cry";
  else if (stateName === "white") state.avatarAction = "jump";
  else state.avatarAction = "walk";

  // Sync state to local desktop pet server if active
  if (stateName) {
    let action = state.avatarAction;
    fetch("http://localhost:5678/api/state", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ state: stateName, action: action })
    }).catch(err => {
      // Fail silently if local server is not running
    });
  }

  const badgeText = document.getElementById("badge-state-name");
  const badgeContainer = document.getElementById("state-badge-container");
  const rebornBanner = document.getElementById("warning-reborn-banner");
  
  if (badgeText) {
    badgeText.textContent = stateName === "black" ? "重度沉迷" : (stateName === "white" ? "自律重生" : "正常疗愈");
  }
  if (badgeContainer) {
    badgeContainer.className = `avatar-state-badge state-${stateName}`;
  }
  if (rebornBanner) {
    if (stateName === "white") rebornBanner.classList.add("active");
    else rebornBanner.classList.remove("active");
  }

  if (typeof updateTopologyValues === "function") {
    updateTopologyValues();
  }
}

// --- 18b. Chrome Extension Communication Bridge ---
if (window.chrome && chrome.runtime && chrome.runtime.onMessage) {
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "triggerOvertime") {
      triggerBlockerWarning(60); // Trigger warning with 60 seconds (1 minute) overtime
      sendResponse({ success: true });
    }
  });
}

// --- 19. Phase 3: SVG Attention Topology Map & AI Coach Functions ---
let titleBlinkInterval = null;

function startTitleBlinking() {
  if (titleBlinkInterval) return;
  let isRed = true;
  titleBlinkInterval = setInterval(() => {
    document.title = isRed ? "🔴【专注防线已决口！】" : "⚠️【请立刻返回专注】";
    isRed = !isRed;
  }, 1000);
}

function stopTitleBlinking() {
  if (titleBlinkInterval) {
    clearInterval(titleBlinkInterval);
    titleBlinkInterval = null;
  }
  document.title = "Tryrevive - 夺回你的注意力主权";
}

function initTopologyGraph() {
  updateTopologyValues();
}

function updateTopologyValues() {
  if (!state.currentUser || !state.userProfile) return;

  const valZen = document.getElementById("node-val-zen");
  const valDistract = document.getElementById("node-val-distract");
  const valFocus = document.getElementById("node-val-focus");
  const statusIndicator = document.getElementById("topology-status-indicator");

  if (valZen) {
    valZen.textContent = `${state.userProfile.meditationCount || 0}次 (今日复位)`;
  }
  if (valDistract) {
    valDistract.textContent = `${state.userProfile.timeoutCount || 0}次 (今日超时)`;
  }
  if (valFocus) {
    const focusStr = state.userProfile.firstStep || "未定第一步";
    valFocus.textContent = focusStr.length > 12 ? focusStr.substring(0, 11) + "..." : focusStr;
  }

  // Update status label
  if (statusIndicator) {
    if (state.avatarState === "white") {
      statusIndicator.textContent = "系统自律韧性高";
      statusIndicator.style.color = "#34d399";
    } else if (state.avatarState === "black") {
      statusIndicator.textContent = "防线已发生偏离";
      statusIndicator.style.color = "#f87171";
    } else {
      statusIndicator.textContent = "状态缓慢收敛中";
      statusIndicator.style.color = "var(--accent-light)";
    }
  }

  // Dynamically modulate pulsing speeds based on state
  const pulseZen = document.getElementById("pulse-zen-path");
  const pulseDistract = document.getElementById("pulse-distract-path");
  const pulseLoop = document.getElementById("pulse-loop-path");

  if (pulseZen && pulseDistract && pulseLoop) {
    if (state.avatarState === "white") {
      pulseZen.style.animationDuration = "2s";
      pulseDistract.style.animationDuration = "30s";
      pulseLoop.style.animationDuration = "4s";
    } else if (state.avatarState === "black") {
      pulseZen.style.animationDuration = "20s";
      pulseDistract.style.animationDuration = "1.5s";
      pulseLoop.style.animationDuration = "15s";
    } else {
      pulseZen.style.animationDuration = "6s";
      pulseDistract.style.animationDuration = "8s";
      pulseLoop.style.animationDuration = "10s";
    }
  }
}

function selectTopologyNode(nodeType) {
  let reply = "";
  if (nodeType === 'mindfulness') {
    reply = `🧘 <b>禅定力状态分析</b>：你的自律能量环路目前已完成 <b>${state.userProfile.meditationCount || 0}</b> 次心流复位。当前心率与呼吸反馈平衡度较好。建议每次离页超时均回到此处复位。`;
  } else if (nodeType === 'distraction') {
    reply = `⚡ <b>防线偏差诊断</b>：今天防线累计超时 <b>${state.userProfile.timeoutCount || 0}</b> 次。检测到算法阻抗较高，请点击上方 App 图标时，务必填写目标承诺。`;
  } else {
    reply = `🎯 <b>专注核心诊断</b>：当前目标为「${state.userProfile.motivation || "未设定"}」。你的第一步微动作是：『${state.userProfile.firstStep || "未设定"}』。专注能量正在以此核心辐射。`;
  }
  appendCoachBubble(reply, 'coach');
}

function sendCoachSuggestion(text) {
  appendCoachBubble(text, 'user');
  processCoachReply(text);
}

function sendCoachMessage() {
  const input = document.getElementById("goal-first-step-input");
  if (!input) return;
  const text = input.value.trim();
  if (!text) return;
  input.value = "";

  appendCoachBubble(text, 'user');
  processCoachReply(text);
}

function handleCoachKeyPress(event) {
  if (event.key === "Enter") {
    sendCoachMessage();
  }
}

function appendCoachBubble(text, sender) {
  const history = document.getElementById("chat-history-box");
  if (!history) return;

  const bubble = document.createElement("div");
  bubble.className = `chat-bubble bubble-${sender}`;
  bubble.innerHTML = text;
  
  if (sender === 'coach') {
    bubble.style.cssText = "font-size: 0.75rem; line-height: 1.45; padding: 0.55rem 0.85rem; border-radius: 10px; max-width: 92%; background: rgba(255, 138, 101, 0.05); border: 1px solid rgba(255, 138, 101, 0.08); align-self: flex-start; color: #ffd0c0; border-bottom-left-radius: 2px; margin-bottom: 0.4rem;";
  } else {
    bubble.style.cssText = "font-size: 0.75rem; line-height: 1.45; padding: 0.55rem 0.85rem; border-radius: 10px; max-width: 92%; background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.05); align-self: flex-end; color: #ffffff; border-bottom-right-radius: 2px; margin-bottom: 0.4rem;";
  }
  
  history.appendChild(bubble);
  history.scrollTop = history.scrollHeight;
}

function processCoachReply(userMsg) {
  state.userProfile.firstStep = userMsg;
  localStorage.setItem(`tryrevive_save_${state.currentUser}`, JSON.stringify(state.userProfile));
  
  // Directly sync with original DOM states
  const goalInput = document.getElementById("goal-first-step-input");
  if (goalInput && goalInput.value !== userMsg) {
    goalInput.value = userMsg;
  }
  
  const history = document.getElementById("chat-history-box");
  if (!history) return;

  const thinkingBubble = document.createElement("div");
  thinkingBubble.className = "chat-bubble bubble-coach thinking-indicator";
  thinkingBubble.innerHTML = "<i>AI 教练正在为您解构专注步骤...</i>";
  thinkingBubble.style.cssText = "font-size: 0.75rem; line-height: 1.45; padding: 0.55rem 0.85rem; border-radius: 10px; max-width: 92%; background: rgba(255, 138, 101, 0.05); border: 1px solid rgba(255, 138, 101, 0.08); align-self: flex-start; color: #ffd0c0; border-bottom-left-radius: 2px; margin-bottom: 0.4rem;";
  history.appendChild(thinkingBubble);
  history.scrollTop = history.scrollHeight;

  fetchAICoachFeedback("chat_deconstruct", (coachResponse) => {
    thinkingBubble.remove();
    
    let reply = coachResponse;
    if (coachResponse.includes("继续沉溺") || coachResponse === getLocalFallbackQuote("chat_deconstruct")) {
      reply = generateLocalCoachStepBreakdown(userMsg);
    } else {
      appendCoachBubble(reply, 'coach');
    }
  });
}

function generateLocalCoachStepBreakdown(userMsg) {
  let reply = "";
  if (userMsg.includes("短视频") || userMsg.includes("抖音") || userMsg.includes("B站") || userMsg.includes("视频") || userMsg.includes("手机")) {
    state.userProfile.step2 = "起身做 3 个腹式呼吸，重整感官";
    state.userProfile.step3 = "进入 1 分钟快速禅修以物理复位";
    reply = "📱 <b>教练诊断：</b> 推荐流利用了你的即时奖赏回路。我已为您规划好后续的破局步骤：<br>1. <b>第一步：</b>" + userMsg + "<br>2. <b>第二步：</b>起身做 3 个腹式呼吸，重整感官<br>3. <b>第三步：</b>进入 1 分钟快速禅修以物理复位";
  } else if (userMsg.includes("大") || userMsg.includes("不知道") || userMsg.includes("动笔") || userMsg.includes("下笔") || userMsg.includes("写") || userMsg.includes("复杂")) {
    state.userProfile.step2 = "列出 3 个核心大纲组块";
    state.userProfile.step3 = "专注撰写第一组块的前两百字";
    reply = "📝 <b>教练诊断：</b> 大脑抗拒行动是因为目标缺乏物理细节。已为您降阻拆解计划：<br>1. <b>第一步：</b>" + userMsg + "<br>2. <b>第二步：</b>列出 3 个核心大纲组块<br>3. <b>第三步：</b>专注撰写第一组块的前两百字";
  } else {
    state.userProfile.step2 = "关闭外部通知，保持单线程";
    state.userProfile.step3 = "持续推进 15 分钟完成首期交付";
    reply = "🎯 <b>教练诊断：</b> 起步最难，做 1 分钟即可冲破零惯性。已为您生成行动双链：<br>1. <b>第一步：</b>" + userMsg + "<br>2. <b>第二步：</b>关闭外部通知，保持单线程<br>3. <b>第三步：</b>持续推进 15 分钟完成首期交付";
  }
  localStorage.setItem(`tryrevive_save_${state.currentUser}`, JSON.stringify(state.userProfile));
  
  // Show steps display on DOM
  const stepsDisplay = document.getElementById("goal-plan-steps-display");
  const step2El = document.getElementById("display-step-2");
  const step3El = document.getElementById("display-step-3");
  if (stepsDisplay) stepsDisplay.style.display = "block";
  if (step2El) step2El.textContent = state.userProfile.step2;
  if (step3El) step3El.textContent = state.userProfile.step3;

  return reply;
}

// --- 9. Local PyQt6 Desktop Pet Bridge Integration ---
let petServerPollInterval = null;
let petListCached = null;

function startPetServerPolling() {
  if (petServerPollInterval) clearInterval(petServerPollInterval);
  pollPetServerStatus();
  petServerPollInterval = setInterval(pollPetServerStatus, 3000);
}

function stopPetServerPolling() {
  if (petServerPollInterval) {
    clearInterval(petServerPollInterval);
    petServerPollInterval = null;
  }
}

function pollPetServerStatus() {
  const statusBadge = document.getElementById("pet-server-status");
  const serverTip = document.getElementById("pet-server-tip");
  const controlsContainer = document.getElementById("pet-controls-container");
  const toggleBtn = document.getElementById("pet-toggle-btn");
  const petSelect = document.getElementById("pet-select");

  if (!statusBadge || !serverTip || !controlsContainer || !toggleBtn || !petSelect) return;

  fetch("http://localhost:5678/api/status")
    .then(res => res.json())
    .then(data => {
      // Server is online!
      statusBadge.className = "status-badge status-online";
      statusBadge.textContent = "● 本地服务已连接";
      serverTip.style.display = "none";
      controlsContainer.style.display = "flex";

      // Set toggle button state
      if (data.running) {
        toggleBtn.textContent = "关闭桌宠";
        toggleBtn.className = "btn-primary btn-danger";
        petSelect.disabled = true; // Disable selecting other pets while running
      } else {
        toggleBtn.textContent = "开启桌宠";
        toggleBtn.className = "btn-primary";
        petSelect.disabled = false;
      }

      // Fetch pets list if not cached or active pet changed
      fetchPetsList(data.active_pet);
    })
    .catch(err => {
      // Server is offline
      statusBadge.className = "status-badge status-offline";
      statusBadge.textContent = "○ 本地服务未启动";
      serverTip.style.display = "block";
      controlsContainer.style.display = "none";
      petListCached = null;
    });
}

function fetchPetsList(activePet) {
  const petSelect = document.getElementById("pet-select");
  if (!petSelect) return;

  fetch("http://localhost:5678/api/pets")
    .then(res => res.json())
    .then(data => {
      const petsStr = JSON.stringify(data.pets);
      if (petListCached === petsStr) {
        if (activePet) {
          petSelect.value = activePet;
        }
        return;
      }
      petListCached = petsStr;

      // Re-populate select options
      petSelect.innerHTML = "";
      data.pets.forEach(pet => {
        const opt = document.createElement("option");
        opt.value = pet.filename;
        opt.textContent = pet.name;
        petSelect.appendChild(opt);
      });

      if (activePet) {
        petSelect.value = activePet;
      }
    })
    .catch(err => console.error("Failed to fetch pets list", err));
}

function toggleDesktopPet() {
  const toggleBtn = document.getElementById("pet-toggle-btn");
  const petSelect = document.getElementById("pet-select");
  if (!toggleBtn || !petSelect) return;

  const isRunning = toggleBtn.classList.contains("btn-danger");
  const action = isRunning ? "stop" : "start";
  const selectedPet = petSelect.value;

  toggleBtn.disabled = true;
  toggleBtn.textContent = isRunning ? "正在关闭..." : "正在开启...";

  fetch("http://localhost:5678/api/toggle", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: action, pet: selectedPet })
  })
    .then(res => res.json())
    .then(data => {
      toggleBtn.disabled = false;
      pollPetServerStatus();
    })
    .catch(err => {
      toggleBtn.disabled = false;
      alert("操作失败，本地连接异常。请确认 python3 Tryrevive/pet_server.py 正在运行。");
      pollPetServerStatus();
    });
}

// Expose functions globally for HTML inline buttons
window.sendCoachSuggestion = sendCoachSuggestion;
window.sendCoachMessage = sendCoachMessage;
window.handleCoachKeyPress = handleCoachKeyPress;
window.selectTopologyNode = selectTopologyNode;
window.updateTopologyValues = updateTopologyValues;
window.initTopologyGraph = initTopologyGraph;
window.startTitleBlinking = startTitleBlinking;
window.stopTitleBlinking = stopTitleBlinking;
window.toggleDesktopPet = toggleDesktopPet;
window.pollPetServerStatus = pollPetServerStatus;
window.startPetServerPolling = startPetServerPolling;
window.stopPetServerPolling = stopPetServerPolling;



