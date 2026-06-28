const modes = {
  layout: {
    title: "家具布置",
    summary: "保持结构不变，生成带家具的平面布置。",
    resultName: "家具布置平面图"
  },
  colored: {
    title: "彩平生成",
    summary: "基于布置结果生成更适合展示的彩色平面图。",
    resultName: "彩色平面图"
  },
  axon: {
    title: "3D 轴侧",
    summary: "把平面方案转换成 45 度轴侧空间表达。",
    resultName: "3D 轴侧图"
  },
  room: {
    title: "房间效果",
    summary: "按房间清单逐间生成独立室内效果图。",
    resultName: "分房间效果图"
  },
  enhance: {
    title: "质感增强",
    summary: "在原效果图基础上提升光影、材质和摄影感。",
    resultName: "增强效果图"
  }
};

const appVersion = "20260628-demo-assets";

const generatedAssets = {
  layout: "/generated/layout.png",
  colored: "/generated/colored.png",
  axon: "/generated/axon.png",
  room: "/generated/room.png",
  enhance: "/generated/enhance.png"
};

const roomDemoAssets = {
  living: "/generated/rooms/living.png",
  master: "/generated/rooms/master.png",
  bedroom: "/generated/rooms/bedroom.png",
  second: "/generated/rooms/bedroom.png",
  child: "/generated/rooms/bedroom.png",
  kitchen: "/generated/rooms/living.png",
  dining: "/generated/rooms/living.png",
  selected: "/generated/room.png",
  fallback: "/generated/room.png"
};

const paletteByStyle = {
  "现代简约": ["#f3f5f4", "#d7dedb", "#7c8a89", "#1f2c32"],
  "现代奶油风": ["#f4eee4", "#d8c7ad", "#b98f61", "#5f5348"],
  "新中式": ["#eee8df", "#b99d6f", "#6c2f2f", "#182323"],
  "法式": ["#f0ece7", "#c8b6a2", "#8d9dae", "#6e5b51"],
  "侘寂风": ["#e9e3d8", "#b8aa95", "#7c766b", "#2f332d"],
  "原木风": ["#f4efe6", "#d1ad7c", "#8b6137", "#2f3f38"]
};

const state = {
  mode: "layout",
  sourceImage: null,
  sourceName: "",
  currentResult: null,
  demoOnly: false,
  results: []
};

const roomDefinitions = [
  { key: "living", label: "客厅", aliases: ["客厅", "起居室"] },
  { key: "master", label: "主卧", aliases: ["主卧", "主人房", "主卧室"] },
  { key: "second", label: "次卧", aliases: ["次卧", "次卧室", "客卧"] },
  { key: "elder", label: "老人房", aliases: ["老人房", "长辈房", "父母房"] },
  { key: "bedroom", label: "卧室", aliases: ["卧室", "睡房"] },
  { key: "child", label: "儿童房", aliases: ["儿童房", "小孩房", "男孩房", "女孩房"] },
  { key: "study", label: "书房", aliases: ["书房", "办公区", "工作区"] },
  { key: "dining", label: "餐厅", aliases: ["餐厅", "餐区"] },
  { key: "kitchen", label: "厨房", aliases: ["厨房", "厨区", "开放式厨房"] },
  { key: "bathroom", label: "卫生间", aliases: ["卫生间", "浴室", "洗手间", "厕所"] },
  { key: "balcony", label: "阳台", aliases: ["阳台", "露台"] },
  { key: "entry", label: "玄关", aliases: ["玄关", "入户", "门厅"] },
  { key: "cloakroom", label: "衣帽间", aliases: ["衣帽间", "衣帽区"] }
];

const el = {
  canvas: document.getElementById("resultCanvas"),
  empty: document.getElementById("emptyState"),
  steps: [...document.querySelectorAll(".step")],
  modeTitle: document.getElementById("modeTitle"),
  modeSummary: document.getElementById("modeSummary"),
  generate: document.getElementById("generateButton"),
  floorUpload: document.getElementById("floorUpload"),
  uploadName: document.getElementById("uploadName"),
  projectName: document.getElementById("projectName"),
  roomBrief: document.getElementById("roomBrief"),
  roomType: document.getElementById("roomType"),
  stylePreset: document.getElementById("stylePreset"),
  materialPreset: document.getElementById("materialPreset"),
  lightingPreset: document.getElementById("lightingPreset"),
  advancedPrompt: document.getElementById("advancedPrompt"),
  promptPreview: document.getElementById("promptPreview"),
  apiStatus: document.getElementById("apiStatus"),
  resultStack: document.getElementById("resultStack"),
  resultCount: document.getElementById("resultCount"),
  saveState: document.getElementById("saveState"),
  saveProject: document.getElementById("saveProject"),
  exportProject: document.getElementById("exportProject"),
  downloadCurrent: document.getElementById("downloadCurrent")
};

const ctx = el.canvas.getContext("2d");

function getConfig() {
  return {
    projectName: el.projectName.value.trim() || "未命名项目",
    roomBrief: el.roomBrief.value.trim(),
    roomType: el.roomType.value,
    style: el.stylePreset.value,
    material: el.materialPreset.value,
    lighting: el.lightingPreset.value,
    advancedPrompt: el.advancedPrompt.value.trim()
  };
}

function getRoomEffectTargets() {
  const brief = el.roomBrief.value.trim();
  const targets = [];
  const hasSpecificBedroom = /主卧|次卧|儿童房|小孩房|客卧|老人房|男孩房|女孩房/.test(brief);
  const appendTarget = (room) => {
    if (!targets.some((item) => item.key === room.key || item.label === room.label)) {
      targets.push({ key: room.key, label: room.label });
    }
  };

  roomDefinitions.forEach((room) => {
    if (room.key === "bedroom" && hasSpecificBedroom) return;
    if (room.aliases.some((alias) => brief.includes(alias))) {
      appendTarget(room);
    }
  });

  const looksLikeWholeHome = /户|家|两居|两室|三居|三室|主卧|次卧|厨房|客厅/.test(brief);
  if (looksLikeWholeHome) {
    if (/三口|孩子|儿童|小孩/.test(brief)) {
      appendTarget({ key: "child", label: "儿童房" });
    } else if (/主卧|两居|两室|小户型/.test(brief)) {
      appendTarget({ key: "second", label: "次卧" });
    }
    if (/餐桌|餐区|餐厨/.test(brief)) {
      appendTarget({ key: "dining", label: "餐厅" });
    }
    if (targets.length >= 3) {
      appendTarget({ key: "bathroom", label: "卫生间" });
    }
  }

  if (!targets.length) {
    targets.push({ key: "selected", label: el.roomType.value || "房间" });
  }

  return targets;
}

function getRoomEffectConfig(room) {
  const config = getConfig();
  return {
    ...config,
    roomType: room.label,
    roomBrief: [
      config.roomBrief,
      `当前任务：只生成「${room.label}」这一间房的室内效果图。`,
      "输出应为站在房间内看到的透视效果，不要生成整套户型图、彩平图或轴侧图。"
    ].join("\n")
  };
}

function composePrompt(mode = state.mode, config = getConfig()) {
  const target = modes[mode].resultName;
  return [
    `目标：${target}`,
    `房间：${config.roomType}`,
    `风格：${config.style}`,
    `材质：${config.material}`,
    `光影：${config.lighting}`,
    `说明：${config.roomBrief}`,
    `约束：${config.advancedPrompt}`
  ].join("；");
}

function refreshPrompt() {
  if (state.mode === "room") {
    const rooms = getRoomEffectTargets().map((room) => room.label).join("、");
    el.promptPreview.textContent = `${composePrompt()}；将逐间生成：${rooms}`;
    return;
  }

  el.promptPreview.textContent = composePrompt();
}

function setApiStatus(type, message) {
  el.apiStatus.className = `api-status ${type || ""}`.trim();
  el.apiStatus.querySelector("span").textContent = message;
}

function setMode(mode) {
  state.mode = mode;
  el.steps.forEach((step) => step.classList.toggle("active", step.dataset.mode === mode));
  el.modeTitle.textContent = modes[mode].title;
  el.modeSummary.textContent = modes[mode].summary;
  refreshPrompt();
}

function clearCanvas() {
  ctx.clearRect(0, 0, el.canvas.width, el.canvas.height);
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, el.canvas.width, el.canvas.height);
}

function drawImageContain(image, alpha = 1) {
  const maxWidth = el.canvas.width - 100;
  const maxHeight = el.canvas.height - 170;
  const scale = Math.min(maxWidth / image.width, maxHeight / image.height);
  const width = image.width * scale;
  const height = image.height * scale;
  const x = (el.canvas.width - width) / 2;
  const y = 88;
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.drawImage(image, x, y, width, height);
  ctx.restore();
  return { x, y, width, height };
}

function titleBlock(title, subtitle) {
  ctx.fillStyle = "#172026";
  ctx.font = "800 34px system-ui, sans-serif";
  ctx.fillText(title, 48, 52);
  ctx.fillStyle = "#66727d";
  ctx.font = "18px system-ui, sans-serif";
  ctx.fillText(subtitle, 48, 84);
}

function wrapText(text, x, y, maxWidth, lineHeight, maxLines = 5) {
  const chars = [...text];
  let line = "";
  let lines = 0;
  for (const char of chars) {
    const test = line + char;
    if (ctx.measureText(test).width > maxWidth && line) {
      ctx.fillText(line, x, y);
      line = char;
      y += lineHeight;
      lines += 1;
      if (lines >= maxLines - 1) {
        break;
      }
    } else {
      line = test;
    }
  }
  if (line && lines < maxLines) {
    ctx.fillText(line, x, y);
  }
}

function roundedRect(x, y, width, height, radius = 10) {
  const r = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + width, y, x + width, y + height, r);
  ctx.arcTo(x + width, y + height, x, y + height, r);
  ctx.arcTo(x, y + height, x, y, r);
  ctx.arcTo(x, y, x + width, y, r);
  ctx.closePath();
}

function drawFurniture(plan) {
  const config = getConfig();
  const colors = paletteByStyle[config.style] || paletteByStyle["现代简约"];
  const rooms = [
    { name: "客厅", x: 0.08, y: 0.1, w: 0.42, h: 0.32, c: colors[0] },
    { name: "餐厨", x: 0.53, y: 0.1, w: 0.35, h: 0.32, c: colors[1] },
    { name: "主卧", x: 0.08, y: 0.48, w: 0.38, h: 0.34, c: "#e7edf1" },
    { name: "次卧", x: 0.5, y: 0.48, w: 0.38, h: 0.34, c: "#f0e8dd" }
  ];

  ctx.save();
  ctx.translate(plan.x, plan.y);
  rooms.forEach((room) => {
    const x = room.x * plan.width;
    const y = room.y * plan.height;
    const w = room.w * plan.width;
    const h = room.h * plan.height;
    ctx.fillStyle = room.c;
    ctx.globalAlpha = state.mode === "colored" ? 0.78 : 0.32;
    ctx.fillRect(x, y, w, h);
    ctx.globalAlpha = 1;
    ctx.strokeStyle = "#25313a";
    ctx.lineWidth = state.mode === "colored" ? 3 : 2;
    ctx.strokeRect(x, y, w, h);
    ctx.fillStyle = "#172026";
    ctx.font = "700 17px system-ui, sans-serif";
    ctx.fillText(room.name, x + 14, y + 28);
  });

  const furnitureColor = state.mode === "colored" ? colors[2] : "#0b766d";
  drawSofa(plan.width * 0.16, plan.height * 0.2, plan.width * 0.22, plan.height * 0.08, furnitureColor);
  drawTable(plan.width * 0.27, plan.height * 0.31, plan.width * 0.13, furnitureColor);
  drawBed(plan.width * 0.16, plan.height * 0.58, plan.width * 0.2, plan.height * 0.13, colors[3]);
  drawBed(plan.width * 0.58, plan.height * 0.58, plan.width * 0.18, plan.height * 0.12, colors[3]);
  drawDining(plan.width * 0.62, plan.height * 0.2, plan.width * 0.16, plan.height * 0.1, furnitureColor);
  ctx.restore();
}

function drawSofa(x, y, w, h, color) {
  ctx.fillStyle = color;
  roundedRect(x, y, w, h, 8);
  ctx.fill();
  ctx.fillStyle = "rgba(255,255,255,0.5)";
  ctx.fillRect(x + w * 0.1, y + h * 0.2, w * 0.35, h * 0.6);
  ctx.fillRect(x + w * 0.55, y + h * 0.2, w * 0.35, h * 0.6);
}

function drawTable(x, y, size, color) {
  ctx.fillStyle = color;
  roundedRect(x, y, size, size * 0.58, 999);
  ctx.fill();
}

function drawBed(x, y, w, h, color) {
  ctx.fillStyle = color;
  roundedRect(x, y, w, h, 8);
  ctx.fill();
  ctx.fillStyle = "rgba(255,255,255,0.72)";
  ctx.fillRect(x + 10, y + 8, w - 20, h * 0.28);
}

function drawDining(x, y, w, h, color) {
  ctx.fillStyle = color;
  roundedRect(x, y, w, h, 10);
  ctx.fill();
  ctx.fillStyle = "rgba(255,255,255,0.7)";
  for (let i = 0; i < 4; i += 1) {
    ctx.fillRect(x - 12 + i * (w / 3), y - 16, 18, 12);
    ctx.fillRect(x - 12 + i * (w / 3), y + h + 4, 18, 12);
  }
}

function generateLayout() {
  clearCanvas();
  const config = getConfig();
  titleBlock(modes[state.mode].resultName, `${config.projectName} / ${config.style}`);
  let plan = { x: 80, y: 130, width: 740, height: 790 };
  if (state.sourceImage) {
    plan = drawImageContain(state.sourceImage, state.mode === "colored" ? 0.48 : 0.72);
  } else {
    ctx.strokeStyle = "#1e2b33";
    ctx.lineWidth = 5;
    ctx.strokeRect(plan.x, plan.y, plan.width, plan.height);
  }
  drawFurniture(plan);
  drawFooter(config);
}

function generateRoom(config = getConfig(), title = `${config.roomType}效果图`) {
  clearCanvas();
  const colors = paletteByStyle[config.style] || paletteByStyle["现代简约"];
  titleBlock(title, `${config.roomType} / ${config.style}`);

  const room = { x: 86, y: 160, w: 728, h: 630 };
  const gradient = ctx.createLinearGradient(room.x, room.y, room.x, room.y + room.h);
  gradient.addColorStop(0, colors[0]);
  gradient.addColorStop(1, "#ffffff");
  ctx.fillStyle = gradient;
  ctx.fillRect(room.x, room.y, room.w, room.h);

  ctx.fillStyle = colors[1];
  ctx.beginPath();
  ctx.moveTo(room.x, room.y + room.h);
  ctx.lineTo(room.x + room.w, room.y + room.h);
  ctx.lineTo(room.x + room.w * 0.82, room.y + room.h * 0.56);
  ctx.lineTo(room.x + room.w * 0.18, room.y + room.h * 0.56);
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = "rgba(23,32,38,0.16)";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(room.x + room.w * 0.18, room.y + room.h * 0.56);
  ctx.lineTo(room.x + room.w * 0.18, room.y + 40);
  ctx.moveTo(room.x + room.w * 0.82, room.y + room.h * 0.56);
  ctx.lineTo(room.x + room.w * 0.82, room.y + 40);
  ctx.stroke();

  drawWindow(room.x + room.w * 0.57, room.y + 92, room.w * 0.22, room.h * 0.2);
  drawInteriorFurniture(room, colors, config.roomType);
  drawFooter(config);
}

function drawWindow(x, y, w, h) {
  ctx.fillStyle = "#d8edf1";
  roundedRect(x, y, w, h, 5);
  ctx.fill();
  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = 4;
  ctx.strokeRect(x + w / 2, y + 8, 1, h - 16);
  ctx.strokeRect(x + 8, y + h / 2, w - 16, 1);
}

function drawInteriorFurniture(room, colors, type) {
  ctx.fillStyle = colors[3];
  if (/卧|儿童|客卧|老人房/.test(type)) {
    roundedRect(room.x + 170, room.y + 360, 330, 138, 18);
    ctx.fill();
    ctx.fillStyle = "#f7f2ec";
    ctx.fillRect(room.x + 196, room.y + 378, 278, 48);
    ctx.fillStyle = colors[2];
    roundedRect(room.x + 540, room.y + 338, 72, 168, 10);
    ctx.fill();
    return;
  }
  if (/餐|厨/.test(type)) {
    roundedRect(room.x + 230, room.y + 376, 250, 92, 999);
    ctx.fill();
    ctx.fillStyle = colors[2];
    for (let i = 0; i < 6; i += 1) {
      ctx.fillRect(room.x + 168 + i * 82, room.y + 342, 44, 38);
      ctx.fillRect(room.x + 168 + i * 82, room.y + 470, 44, 38);
    }
    return;
  }
  if (/书房|办公|工作/.test(type)) {
    roundedRect(room.x + 190, room.y + 390, 340, 82, 12);
    ctx.fill();
    ctx.fillStyle = colors[2];
    roundedRect(room.x + 560, room.y + 360, 64, 110, 12);
    ctx.fill();
    ctx.fillStyle = "#ffffff";
    roundedRect(room.x + 270, room.y + 500, 170, 64, 12);
    ctx.fill();
    return;
  }
  roundedRect(room.x + 160, room.y + 392, 350, 112, 18);
  ctx.fill();
  ctx.fillStyle = colors[2];
  roundedRect(room.x + 552, room.y + 340, 82, 150, 12);
  ctx.fill();
  ctx.fillStyle = "#ffffff";
  roundedRect(room.x + 250, room.y + 520, 210, 54, 999);
  ctx.fill();
}

function drawGeneratedAsset(mode, options = {}) {
  const src = options.src || generatedAssets[mode];
  if (!src) return Promise.resolve(false);
  const config = options.config || getConfig();
  const title = options.title || modes[mode].resultName;
  const subtitle = options.subtitle || `Codex 生图样张 / ${config.style}`;

  return new Promise((resolve) => {
    const image = new Image();
    image.onload = () => {
      clearCanvas();
      titleBlock(title, subtitle);
      const bounds = drawImageContain(image, 1);
      ctx.strokeStyle = "rgba(11,118,109,0.45)";
      ctx.lineWidth = 4;
      ctx.strokeRect(bounds.x, bounds.y, bounds.width, bounds.height);
      drawFooter(config);
      resolve(true);
    };
    image.onerror = () => resolve(false);
    image.src = src;
  });
}

function drawImageUrl(src, label, title = modes[state.mode].resultName, config = getConfig()) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => {
      clearCanvas();
      titleBlock(title, label);
      const bounds = drawImageContain(image, 1);
      ctx.strokeStyle = "rgba(11,118,109,0.45)";
      ctx.lineWidth = 4;
      ctx.strokeRect(bounds.x, bounds.y, bounds.width, bounds.height);
      drawFooter(config);
      resolve();
    };
    image.onerror = () => reject(new Error("图片加载失败"));
    image.src = src;
  });
}

async function drawLiveGeneration(options = {}) {
  const mode = options.mode || state.mode;
  const config = options.config || getConfig();
  const prompt = options.prompt || composePrompt(mode, config);
  const response = await fetch("/api/generate", {
    method: "POST",
    headers: {
      "content-type": "application/json"
    },
    body: JSON.stringify({
      mode,
      config,
      prompt,
      sourceName: state.sourceName,
      sourceImageData: state.sourceImage?.src || null
    })
  });
  const data = await response.json().catch(() => ({}));

  if (!response.ok || !data.ok) {
    throw new Error(data.error || `生成接口返回 ${response.status}`);
  }

  await drawImageUrl(
    data.imageUrl,
    `Codex 订阅生图 / ${data.model}`,
    options.title || modes[mode].resultName,
    config
  );
  state.lastApiResult = data;
  return data;
}

function generateEnhance() {
  if (state.currentResult) {
    const image = new Image();
    image.onload = () => {
      clearCanvas();
      titleBlock(modes.enhance.resultName, `${getConfig().lighting} / ${getConfig().style}`);
      const bounds = drawImageContain(image, 1);
      const glow = ctx.createRadialGradient(
        bounds.x + bounds.width * 0.7,
        bounds.y + bounds.height * 0.2,
        20,
        bounds.x + bounds.width * 0.7,
        bounds.y + bounds.height * 0.2,
        bounds.width * 0.65
      );
      glow.addColorStop(0, "rgba(255,246,210,0.72)");
      glow.addColorStop(1, "rgba(255,246,210,0)");
      ctx.fillStyle = glow;
      ctx.fillRect(bounds.x, bounds.y, bounds.width, bounds.height);
      ctx.fillStyle = "rgba(11,118,109,0.08)";
      ctx.fillRect(bounds.x, bounds.y, bounds.width, bounds.height);
      drawFooter(getConfig());
      commitResult();
    };
    image.src = state.currentResult.src;
    return;
  }
  generateRoom();
  commitResult();
}

function drawFooter(config) {
  ctx.fillStyle = "#f7fafb";
  roundedRect(48, 1000, 804, 132, 14);
  ctx.fill();
  ctx.strokeStyle = "#d5dde3";
  ctx.stroke();
  ctx.fillStyle = "#172026";
  ctx.font = "700 22px system-ui, sans-serif";
  ctx.fillText(`${config.roomType} / ${config.style} / ${config.lighting}`, 74, 1042);
  ctx.fillStyle = "#66727d";
  ctx.font = "17px system-ui, sans-serif";
  wrapText(config.roomBrief, 74, 1078, 740, 26, 3);
}

async function generate() {
  if (state.mode === "room") {
    await generateRoomEffects();
    return;
  }

  el.empty.classList.add("hidden");
  el.generate.disabled = true;
  el.generate.textContent = state.demoOnly ? "载入演示..." : "生成中...";
  setApiStatus(
    state.demoOnly ? "warn" : "warn",
    state.demoOnly ? "纯演示模式：正在载入预置样张。" : "正在调用本地 Codex CLI 生图，通常需要 1-3 分钟。"
  );

  let liveDone = false;
  if (!state.demoOnly) {
    try {
      await drawLiveGeneration();
      setApiStatus("ok", "Codex 订阅生图已完成，并保存到本地 public/generated/runs。");
      commitResult();
      liveDone = true;
    } catch (error) {
      setApiStatus(
        "error",
        state.sourceImage
          ? `${error.message}。已上传参考图时不会回退演示样张，请重试或调整输入。`
          : `${error.message}。当前显示本地样张兜底。`
      );
    }
  }

  if (!liveDone && (state.demoOnly || !state.sourceImage)) {
    const drewAsset = await drawGeneratedAsset(state.mode);
    if (drewAsset) {
      commitResult();
    } else if (state.mode === "room") {
      generateRoom();
      commitResult();
    } else if (state.mode === "enhance") {
      generateEnhance();
    } else {
      generateLayout();
      commitResult();
    }
  }

  el.generate.disabled = false;
  el.generate.textContent = "生成";
}

async function generateRoomEffects() {
  const rooms = getRoomEffectTargets();
  el.empty.classList.add("hidden");
  el.generate.disabled = true;
  el.generate.textContent = state.demoOnly ? "载入房间..." : `生成中 0/${rooms.length}`;
  setApiStatus(
    state.demoOnly ? "warn" : "warn",
    state.demoOnly
      ? `纯演示模式：正在载入 ${rooms.length} 个房间的静态样张。`
      : `正在逐间调用本地 Codex CLI 生图，共 ${rooms.length} 间。`
  );

  let completed = 0;
  try {
    for (const room of rooms) {
      const config = getRoomEffectConfig(room);
      const title = `${room.label}效果图`;
      const prompt = composePrompt("room", config);
      el.generate.textContent = state.demoOnly ? `载入 ${completed + 1}/${rooms.length}` : `生成中 ${completed + 1}/${rooms.length}`;

      let liveDone = false;
      if (!state.demoOnly) {
        try {
          await drawLiveGeneration({ mode: "room", config, prompt, title });
          commitResult({ type: "room", title, prompt, config });
          liveDone = true;
        } catch (error) {
          setApiStatus(
            "error",
            state.sourceImage
              ? `${title}生成失败：${error.message}。已上传参考图时不会回退演示样张。`
              : `${title}生成失败：${error.message}。当前显示静态样张兜底。`
          );
          if (state.sourceImage) break;
        }
      }

      if (!liveDone && (state.demoOnly || !state.sourceImage)) {
        const drewAsset = await drawGeneratedAsset("room", {
          src: roomDemoAssets[room.key] || roomDemoAssets.fallback,
          title,
          subtitle: `静态演示样张 / ${config.style}`,
          config
        });
        if (drewAsset) {
          commitResult({ type: "room", title, prompt, config });
        } else {
          generateRoom(config, title);
          commitResult({ type: "room", title, prompt, config });
        }
      }

      completed += 1;
    }

    if (completed > 0) {
      setApiStatus(
        state.demoOnly ? "warn" : "ok",
        state.demoOnly
          ? `纯演示模式：已载入 ${completed} 个房间的静态样张。`
          : `Codex 订阅生图已完成：共生成 ${completed} 个房间效果图。`
      );
    }
  } finally {
    el.generate.disabled = false;
    el.generate.textContent = "生成";
  }
}

function commitResult(options = {}) {
  const type = options.type || state.mode;
  const config = options.config || getConfig();
  const src = options.src || el.canvas.toDataURL("image/png");
  const result = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    type,
    title: options.title || modes[type].resultName,
    src,
    prompt: options.prompt || composePrompt(type, config),
    config,
    createdAt: new Date().toLocaleString("zh-CN", { hour12: false })
  };
  state.results.unshift(result);
  state.currentResult = result;
  renderResults();
  markDirty();
}

function renderResults() {
  el.resultCount.textContent = String(state.results.length);
  el.resultStack.innerHTML = "";
  if (!state.results.length) {
    const empty = document.createElement("p");
    empty.className = "muted";
    empty.textContent = "暂无结果";
    el.resultStack.append(empty);
    return;
  }
  state.results.forEach((result) => {
    const card = document.createElement("article");
    card.className = `result-card ${state.currentResult?.id === result.id ? "active" : ""}`;
    const button = document.createElement("button");
    button.type = "button";
    button.addEventListener("click", () => loadResult(result.id));
    button.innerHTML = `
      <img alt="${result.title}" src="${result.src}" />
      <div>
        <strong>${result.title}</strong>
        <span>${result.config.style} · ${result.createdAt}</span>
      </div>
    `;
    card.append(button);
    el.resultStack.append(card);
  });
}

function loadResult(id) {
  const result = state.results.find((item) => item.id === id);
  if (!result) return;
  const image = new Image();
  image.onload = () => {
    clearCanvas();
    ctx.drawImage(image, 0, 0, el.canvas.width, el.canvas.height);
    state.currentResult = result;
    el.empty.classList.add("hidden");
    renderResults();
  };
  image.src = result.src;
}

function downloadDataUrl(dataUrl, filename) {
  const link = document.createElement("a");
  link.href = dataUrl;
  link.download = filename;
  document.body.append(link);
  link.click();
  link.remove();
}

function downloadCurrent() {
  if (!state.currentResult) return;
  downloadDataUrl(state.currentResult.src, `${state.currentResult.title}-${state.currentResult.id}.png`);
}

function exportProject() {
  const config = getConfig();
  const payload = {
    ...config,
    exportedAt: new Date().toISOString(),
    sourceName: state.sourceName,
    results: state.results.map(({ id, type, title, prompt, config: resultConfig, createdAt }) => ({
      id,
      type,
      title,
      prompt,
      config: resultConfig,
      createdAt
    }))
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  downloadDataUrl(url, `${config.projectName}-方案参数.json`);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function saveProject() {
  const snapshot = {
    appVersion,
    config: getConfig(),
    sourceName: state.sourceName,
    sourceImage: state.sourceImage?.src || null,
    currentResultId: state.currentResult?.id || null,
    results: state.results
  };
  localStorage.setItem("interior-ai-project", JSON.stringify(snapshot));
  el.saveState.textContent = "已保存";
}

function restoreProject() {
  const raw = localStorage.getItem("interior-ai-project");
  if (!raw) return;
  try {
    const snapshot = JSON.parse(raw);
    if (snapshot.appVersion !== appVersion) {
      localStorage.removeItem("interior-ai-project");
      return;
    }
    if (snapshot.config) {
      el.projectName.value = snapshot.config.projectName || el.projectName.value;
      el.roomBrief.value = snapshot.config.roomBrief || el.roomBrief.value;
      el.roomType.value = snapshot.config.roomType || el.roomType.value;
      el.stylePreset.value = snapshot.config.style || el.stylePreset.value;
      el.materialPreset.value = snapshot.config.material || el.materialPreset.value;
      el.lightingPreset.value = snapshot.config.lighting || el.lightingPreset.value;
      el.advancedPrompt.value = snapshot.config.advancedPrompt || el.advancedPrompt.value;
    }
    state.sourceName = snapshot.sourceName || "";
    el.uploadName.textContent = state.sourceName || "未选择文件";
    if (snapshot.sourceImage) {
      const image = new Image();
      image.onload = () => {
        state.sourceImage = image;
      };
      image.src = snapshot.sourceImage;
    }
    state.results = snapshot.results || [];
    state.currentResult = state.results.find((item) => item.id === snapshot.currentResultId) || state.results[0] || null;
    if (state.currentResult) {
      loadResult(state.currentResult.id);
    } else {
      renderResults();
    }
    el.saveState.textContent = "已恢复";
  } catch {
    localStorage.removeItem("interior-ai-project");
  }
}

function markDirty() {
  el.saveState.textContent = "未保存";
}

function handleUpload(event) {
  const file = event.target.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    const image = new Image();
    image.onload = () => {
      state.sourceImage = image;
      state.sourceName = file.name;
      el.uploadName.textContent = file.name;
      clearCanvas();
      titleBlock("原始输入", file.name);
      drawImageContain(image, 1);
      el.empty.classList.add("hidden");
      markDirty();
    };
    image.src = reader.result;
  };
  reader.readAsDataURL(file);
}

function bindEvents() {
  el.steps.forEach((step) => {
    step.addEventListener("click", () => setMode(step.dataset.mode));
  });
  el.generate.addEventListener("click", generate);
  el.floorUpload.addEventListener("change", handleUpload);
  el.downloadCurrent.addEventListener("click", downloadCurrent);
  el.saveProject.addEventListener("click", saveProject);
  el.exportProject.addEventListener("click", exportProject);
  [el.projectName, el.roomBrief, el.roomType, el.stylePreset, el.materialPreset, el.lightingPreset, el.advancedPrompt].forEach((input) => {
    input.addEventListener("input", () => {
      refreshPrompt();
      markDirty();
    });
    input.addEventListener("change", () => {
      refreshPrompt();
      markDirty();
    });
  });
}

async function loadApiConfig() {
  try {
    const response = await fetch("/api/config");
    const data = await response.json();
    state.demoOnly = Boolean(data.demoOnly);
    if (state.demoOnly) {
      setApiStatus("warn", "纯演示模式：公网版本不调用任何 API，只展示预置样张。");
    } else if (data.hasCodexCli) {
      setApiStatus("ok", `本地 Codex CLI 生图已启用：${data.codexVersion || data.model}`);
    } else {
      setApiStatus("warn", "本地服务未检测到可用 Codex CLI。确认已安装并登录 Codex 后重启服务。");
    }
  } catch {
    setApiStatus("error", "无法读取本地生图服务状态。");
  }
}

clearCanvas();
bindEvents();
restoreProject();
setMode("layout");
refreshPrompt();
loadApiConfig();
