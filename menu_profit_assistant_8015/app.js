const state = {
  view: "upload",
  targetMargin: 60,
  storeName: "君超快餐",
  mode: "visual",
  items: [
    { id: 1, name: "经典猪脚饭", cost: 7.2, category: "招牌主食", role: "招牌", weight: 1.4, price: 18.0 },
    { id: 2, name: "香脆烧鸭饭", cost: 6.4, category: "招牌主食", role: "热销", weight: 1.3, price: 17.0 },
    { id: 3, name: "盐焗手撕鸡饭", cost: 6.1, category: "招牌主食", role: "热销", weight: 1.2, price: 17.0 },
    { id: 4, name: "香煎鸡扒饭", cost: 5.8, category: "招牌主食", role: "利润", weight: 1.1, price: 17.0 },
    { id: 5, name: "蜜汁叉烧饭", cost: 6.9, category: "招牌主食", role: "常规", weight: 1, price: 20.0 },
    { id: 6, name: "香卤大肠饭", cost: 8.4, category: "招牌主食", role: "常规", weight: 1, price: 23.0 },
    { id: 7, name: "牛肉丸汤粉", cost: 8.8, category: "原味汤粉", role: "汤粉", weight: 0.9, price: 22.0 },
    { id: 8, name: "猪杂汤粉", cost: 7.8, category: "原味汤粉", role: "汤粉", weight: 0.9, price: 20.0 },
    { id: 9, name: "猪脚例牌", cost: 12.8, category: "卤水例牌", role: "例牌", weight: 0.8, price: 35.0 },
    { id: 10, name: "猪脚四点例牌", cost: 13.1, category: "卤水例牌", role: "例牌", weight: 0.8, price: 35.0 },
    { id: 11, name: "卤蛋", cost: 0.6, category: "小菜加拼", role: "加料", weight: 0.7, price: 3.0 },
    { id: 12, name: "豆干", cost: 0.5, category: "小菜加拼", role: "加料", weight: 0.7, price: 2.0 },
    { id: 13, name: "青菜", cost: 1.2, category: "小菜加拼", role: "加料", weight: 0.7, price: 6.0 },
    { id: 14, name: "一条肉卷", cost: 5.2, category: "小菜加拼", role: "加拼", weight: 0.7, price: 18.0 },
    { id: 15, name: "加拼鸡扒", cost: 3.2, category: "小菜加拼", role: "加拼", weight: 0.7, price: 10.0 },
    { id: 16, name: "加拼猪脚", cost: 4.2, category: "小菜加拼", role: "加拼", weight: 0.7, price: 10.0 },
    { id: 17, name: "老火汤", cost: 1.0, category: "饮品汤品", role: "汤品", weight: 0.6, price: 1.9 },
    { id: 18, name: "冻柠乐", cost: 1.0, category: "饮品汤品", role: "饮品", weight: 0.6, price: 2.5 },
  ],
  combos: [],
  imagesGenerated: false,
};

const roleMargin = {
  招牌: 0.58,
  热销: 0.60,
  利润: 0.68,
  常规: 0.62,
  汤粉: 0.60,
  例牌: 0.64,
  加料: 0.74,
  加拼: 0.68,
  汤品: 0.72,
  饮品: 0.72,
};

const qs = (selector) => document.querySelector(selector);
const qsa = (selector) => [...document.querySelectorAll(selector)];
const money = (value) => Number(value).toFixed(1).replace(/\.0$/, "");
const percent = (value) => `${(value * 100).toFixed(1)}%`;

function recommendedPrice(item) {
  const margin = roleMargin[item.role] ?? state.targetMargin / 100;
  return Math.round((item.cost / (1 - margin)) * 10) / 10;
}

function margin(price, cost) {
  return price > 0 ? (price - cost) / price : 0;
}

function getItem(name) {
  return state.items.find((item) => item.name === name);
}

function buildCombos() {
  const soup = getItem("老火汤");
  const drink = getItem("冻柠乐");
  const egg = getItem("卤蛋");
  const tofu = getItem("豆干");
  const pork = getItem("经典猪脚饭");
  const duck = getItem("香脆烧鸭饭");
  const chicken = getItem("盐焗手撕鸡饭");
  const steak = getItem("香煎鸡扒饭");
  const intestine = getItem("香卤大肠饭");

  const combos = [
    {
      id: 101,
      name: "猪脚 + 手撕鸡饭套餐",
      type: "热销双拼饭",
      parts: [pork, chicken, drink],
      weight: 1.5,
      image: true,
    },
    {
      id: 102,
      name: "猪脚 + 烧鸭饭套餐",
      type: "热销双拼饭",
      parts: [pork, duck, drink],
      weight: 1.45,
      image: true,
    },
    {
      id: 103,
      name: "猪脚 + 鸡扒饭套餐",
      type: "热销双拼饭",
      parts: [pork, steak, soup],
      weight: 1.4,
      image: true,
    },
    {
      id: 104,
      name: "猪脚 + 大肠饭套餐",
      type: "热销双拼饭",
      parts: [pork, intestine, soup],
      weight: 1.3,
      image: false,
    },
    {
      id: 105,
      name: "经典猪脚饭 + 卤蛋 + 老火汤",
      type: "招牌套餐",
      parts: [pork, egg, soup],
      weight: 1.35,
      image: true,
    },
    {
      id: 106,
      name: "香脆烧鸭饭 + 豆干 + 冻柠乐",
      type: "招牌套餐",
      parts: [duck, tofu, drink],
      weight: 1.25,
      image: true,
    },
  ];

  combos.forEach((combo) => {
    const cost = combo.parts.reduce((sum, item) => sum + item.cost, 0);
    const singleTotal = combo.parts.reduce((sum, item) => sum + item.price, 0);
    const target = cost / (1 - Math.max(0.56, state.targetMargin / 100 - 0.02));
    combo.cost = Math.round(cost * 10) / 10;
    combo.price = combo.price ?? Math.round(Math.min(target, singleTotal - 1.2) * 10) / 10;
  });

  state.combos = combos;
}

function computeMenuMargin() {
  const itemRows = state.items.map((item) => ({
    gross: (item.price - item.cost) * item.weight,
    sales: item.price * item.weight,
  }));
  const comboRows = state.combos.map((combo) => ({
    gross: (combo.price - combo.cost) * combo.weight,
    sales: combo.price * combo.weight,
  }));
  const all = [...itemRows, ...comboRows];
  const gross = all.reduce((sum, row) => sum + row.gross, 0);
  const sales = all.reduce((sum, row) => sum + row.sales, 0);
  return sales ? gross / sales : 0;
}

function updateMetrics() {
  const menuMargin = computeMenuMargin();
  qs("#menuMargin").textContent = percent(menuMargin);
  qs("#comboCount").textContent = state.combos.length;
  qs("#dishCount").textContent = state.items.length;
  qs("#imageCount").textContent = state.imagesGenerated ? 10 : 0;
  qs("#marginStatus").textContent =
    menuMargin >= state.targetMargin / 100 ? "已达到目标毛利" : "毛利低于目标";
  qs("#marginStatus").classList.toggle("warn", menuMargin < state.targetMargin / 100);
}

function renderItems() {
  qs("#itemsBody").innerHTML = state.items
    .map((item) => {
      const itemMargin = margin(item.price, item.cost);
      const badgeClass = item.role === "招牌" || item.role === "热销" ? "signature" : item.role === "利润" || item.role === "加料" ? "profit" : "";
      return `
        <tr>
          <td><strong>${item.name}</strong></td>
          <td>${item.category}</td>
          <td>¥${money(item.cost)}</td>
          <td><input class="price-input" data-kind="item" data-id="${item.id}" type="number" step="0.1" value="${item.price.toFixed(1)}"></td>
          <td>${percent(itemMargin)}</td>
          <td><span class="badge ${badgeClass}">${item.role}</span></td>
        </tr>
      `;
    })
    .join("");
}

function renderCombos() {
  qs("#comboList").innerHTML = state.combos
    .map((combo) => `
      <article class="combo-card">
        <header>
          <div>
            <h4>${combo.name}</h4>
            <div class="combo-meta">
              <span>${combo.type}</span>
              <span>成本 ¥${money(combo.cost)}</span>
              <span>毛利 ${percent(margin(combo.price, combo.cost))}</span>
            </div>
          </div>
          <input class="price-input" data-kind="combo" data-id="${combo.id}" type="number" step="0.1" value="${combo.price.toFixed(1)}">
        </header>
        <p class="prompt-box">${combo.parts.map((item) => item.name).join(" + ")}，系统按横版快餐菜单自动生成组合。</p>
      </article>
    `)
    .join("");
}

function imagePrompt(name) {
  return `一份${name}，真实中式快餐摄影风格，米饭和主料清晰可见，45度俯拍，明亮灯光，适合横版A4菜单印刷，无文字、无水印。`;
}

function renderImageTasks() {
  const picks = [
    ...state.combos.filter((combo) => combo.image).slice(0, 5).map((combo) => combo.name),
    ...state.items.filter((item) => ["招牌", "热销", "汤粉"].includes(item.role)).slice(0, 5).map((item) => item.name),
  ].slice(0, 10);

  qs("#imageTaskList").innerHTML = picks
    .map((name, index) => `
      <article class="image-task">
        <header>
          <h4>${name}</h4>
          <span class="badge ${state.imagesGenerated ? "profit" : ""}">${state.imagesGenerated ? "已生成" : "待生成"}</span>
        </header>
        <div class="prompt-box">${imagePrompt(name)}</div>
      </article>
    `)
    .join("");
}

function renderFieldPreview() {
  qs("#fieldPreviewBody").innerHTML = state.items
    .slice(0, 10)
    .map((item) => `
      <tr>
        <td><strong>${item.name}</strong></td>
        <td>¥${money(item.cost)}</td>
        <td>${item.category}</td>
      </tr>
    `)
    .join("");
}

function photoCard(name, price, tag) {
  return `
    <div class="menu-photo-card">
      <div class="photo-dish ${state.imagesGenerated ? "generated" : ""}" data-name="${tag || "AI 菜品图"}"></div>
      <div class="photo-info">
        <strong>${name}</strong>
        <em>¥${money(price)}<small>/份</small></em>
      </div>
    </div>
  `;
}

function menuRow(name, price, note = "") {
  return `
    <div class="menu-row">
      <div>
        <strong>${name}</strong>
        ${note ? `<small>${note}</small>` : ""}
      </div>
      <em>¥${money(price)}</em>
    </div>
  `;
}

function renderMenuPaper() {
  const store = state.storeName || "快餐菜单";
  const hotCombos = state.combos.filter((combo) => combo.type === "热销双拼饭").slice(0, 4);
  const signatureCombos = state.combos.filter((combo) => combo.type === "招牌套餐").slice(0, 2);
  const mains = state.items.filter((item) => item.category === "招牌主食").slice(0, 7);
  const soups = state.items.filter((item) => item.category === "原味汤粉").slice(0, 4);
  const plates = state.items.filter((item) => item.category === "卤水例牌").slice(0, 3);
  const sides = state.items.filter((item) => item.category === "小菜加拼").slice(0, 8);
  const drinks = state.items.filter((item) => item.category === "饮品汤品");

  qs("#menuPaper").className = `a4-paper landscape clean ${state.mode === "dense" ? "dense" : ""}`;
  qs("#menuPaper").innerHTML = `
    <div class="landscape-frame">
      <section class="menu-column hero-column">
        <div class="menu-title-block">
          <h2>${store}</h2>
          <p>新鲜现做 · 快速出餐 · 推荐套餐</p>
        </div>
        <div class="section-ribbon">
          <strong>热销双拼饭</strong>
          <span>SELL LIKE HOT CAKES</span>
        </div>
        <div class="big-combo-list">
          ${hotCombos.map((combo, index) => `
            <article class="big-combo">
              <div class="photo-dish ${state.imagesGenerated ? "generated" : ""}" data-name="TOP${index + 1}"></div>
              <div>
                <strong>${combo.name}</strong>
                <em>¥${money(combo.price)}<small>/份</small></em>
              </div>
            </article>
          `).join("")}
        </div>
      </section>

      <section class="menu-column center-column">
        <div class="section-ribbon">
          <strong>招牌卤味饭</strong>
          <span>SIGNBOARD STEWED RICE</span>
        </div>
        <div class="feature-grid">
          ${signatureCombos.map((combo) => photoCard(combo.name, combo.price, "推荐")).join("")}
        </div>
        <div class="mini-grid">
          ${mains.map((item) => photoCard(item.name, item.price, item.role)).join("")}
        </div>
      </section>

      <section class="menu-column side-column">
        <div class="section-ribbon">
          <strong>原味汤粉</strong>
          <span>SOUP NOODLE</span>
        </div>
        <div class="compact-photo-grid">
          ${soups.map((item) => photoCard(item.name, item.price, "汤粉")).join("")}
        </div>

        <div class="section-ribbon small">
          <strong>卤水例牌</strong>
          <span>SAMPLE CARD</span>
        </div>
        <div class="menu-list tight">
          ${plates.map((item) => menuRow(item.name, item.price)).join("")}
        </div>

        <div class="section-ribbon small">
          <strong>小菜 & 加拼</strong>
          <span>SIDE DISHES</span>
        </div>
        <div class="side-list">
          ${sides.map((item) => menuRow(item.name, item.price)).join("")}
        </div>

        <div class="benefit-strip">
          ${drinks.map((item) => `<span>${item.name} ¥${money(item.price)}</span>`).join("")}
          <strong>免费续饭 · 免费例汤</strong>
        </div>
      </section>
    </div>
  `;
}

function renderAll() {
  renderItems();
  renderCombos();
  renderImageTasks();
  renderFieldPreview();
  renderMenuPaper();
  updateMetrics();
}

function setView(view) {
  state.view = view;
  qsa(".app-view").forEach((viewEl) => viewEl.classList.remove("is-active"));
  qs(`#${view}View`).classList.add("is-active");
  qsa(".step").forEach((step, index) => {
    const active = step.dataset.view === view;
    const order = ["upload", "fields", "result"].indexOf(view);
    step.classList.toggle("is-active", active);
    step.classList.toggle("is-done", index < order);
  });
  const meta = {
    upload: ["第 1 步", "上传菜品成本表"],
    fields: ["第 2 步", "确认字段识别"],
    result: ["第 3 步", "横版菜单生成结果"],
  };
  qs("#viewEyebrow").textContent = meta[view][0];
  qs("#viewTitle").textContent = meta[view][1];
}

function bindEvents() {
  qs("#storeName").addEventListener("input", (event) => {
    state.storeName = event.target.value;
    renderMenuPaper();
  });
  qs("#targetMargin").addEventListener("input", (event) => {
    state.targetMargin = Number(event.target.value || 60);
    updateMetrics();
  });
  qs("#useSample").addEventListener("click", () => setView("fields"));
  qs("#fileInput").addEventListener("change", () => setView("fields"));
  qs("#confirmFields").addEventListener("click", () => {
    state.imagesGenerated = true;
    renderAll();
    setView("result");
  });
  qs("#generatePlan").addEventListener("click", () => {
    state.imagesGenerated = true;
    renderAll();
    setView("result");
  });
  qs("#resetPrices").addEventListener("click", () => {
    state.items.forEach((item) => {
      item.price = recommendedPrice(item);
    });
    buildCombos();
    renderAll();
  });
  qs("#exportMenu").addEventListener("click", () => window.print());

  qsa(".step").forEach((step) => {
    step.addEventListener("click", () => setView(step.dataset.view));
  });
  qsa(".tab").forEach((tab) => {
    tab.addEventListener("click", () => {
      qsa(".tab").forEach((item) => item.classList.remove("is-active"));
      qsa(".tab-body").forEach((item) => item.classList.remove("is-active"));
      tab.classList.add("is-active");
      qs(`#${tab.dataset.tab}Tab`).classList.add("is-active");
    });
  });
  qsa(".segmented button").forEach((button) => {
    button.addEventListener("click", () => {
      qsa(".segmented button").forEach((item) => item.classList.remove("is-active"));
      button.classList.add("is-active");
      state.mode = button.dataset.mode;
      renderMenuPaper();
    });
  });
  document.addEventListener("change", (event) => {
    const input = event.target.closest(".price-input");
    if (!input) return;
    const id = Number(input.dataset.id);
    const value = Number(input.value || 0);
    if (input.dataset.kind === "item") {
      const item = state.items.find((row) => row.id === id);
      item.price = value;
      buildCombos();
    } else {
      const combo = state.combos.find((row) => row.id === id);
      combo.price = value;
    }
    renderAll();
  });
}

buildCombos();
renderAll();
bindEvents();
