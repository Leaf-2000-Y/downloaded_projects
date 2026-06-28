export type MessageRole = "assistant" | "user" | "system";

export type Message = {
  id: string;
  role: MessageRole;
  content: string;
  createdAt: string;
};

export type RequirementFields = {
  idea: string;
  targetUser: string;
  contextPain: string;
  currentAlternative: string;
  competitors: string;
  frequency: string;
  willingnessToPay: string;
  researchNotes: string;
  mvpScope: string;
  risks: string;
  validationEvidence: string;
  scenario: string;
  painPoint: string;
};

export type ResearchItem = {
  title: string;
  url: string;
  snippet: string;
  source: string;
  kind: "competitor" | "alternative" | "evidence";
};

export type ResearchState = {
  status: "idle" | "searching" | "ready" | "error";
  query: string;
  items: ResearchItem[];
  summary: string;
  error?: string;
  updatedAt?: string;
};

export type DemandScore = {
  total: number;
  realScenario: number;
  frequency: number;
  alternativeCost: number;
  willingnessToPay: number;
  mvpFeasibility: number;
  differentiation: number;
  riskControl: number;
};

export type DemandEvaluation = {
  verdict: "优先做，进入 MVP" | "可以验证，但先不要重开发" | "风险较高，需要继续访谈" | "大概率伪需求，建议换方向或缩小范围";
  summary: string;
  reasons: string[];
  missingInfo: string[];
  redFlags: string[];
};

export type Question = {
  key: keyof RequirementFields;
  title: string;
  prompt: string;
  hint: string;
};

export type RequirementSession = {
  id: string;
  createdAt: string;
  updatedAt: string;
  idea: string;
  fields: RequirementFields;
  messages: Message[];
  score: DemandScore;
  evaluation: DemandEvaluation;
  prd: string;
  validationPlan: string;
  research: ResearchState;
  status: "collecting" | "ready" | "done";
};

export type DraftBundle = {
  evaluation: DemandEvaluation;
  score: DemandScore;
  prd: string;
  validationPlan: string;
  nextQuestions: Question[];
};

export const QUESTION_ORDER: Question[] = [
  {
    key: "idea",
    title: "初始想法",
    prompt: "先用一句话说出你想做的产品，我会据此判断还缺什么。",
    hint: "例如：帮小红书博主检查文案是否太像 AI。",
  },
  {
    key: "targetUser",
    title: "目标用户",
    prompt: "你的目标用户是谁？请尽量具体到年龄、职业、城市或收入层级。",
    hint: "例如：25-30 岁的小红书副业博主，主业月薪 8k。",
  },
  {
    key: "contextPain",
    title: "场景与痛点",
    prompt: "这个问题通常在什么时间、地点、做什么事时发生？当时最烦、最卡的地方是什么？",
    hint: "例如：晚上发笔记前反复改标题和正文，AI 写得太模板化，发出去容易限流。",
  },
  {
    key: "frequency",
    title: "发生频率",
    prompt: "这个问题大概多久会发生一次？",
    hint: "例如：每天、每周 3 次、每次发稿前都会遇到。",
  },
  {
    key: "willingnessToPay",
    title: "付费证据",
    prompt: "用户有没有花过钱或时间去解决？愿意为此付多少？",
    hint: "例如：月付 19 元，或请人改稿一次 30 元。",
  },
  {
    key: "mvpScope",
    title: "MVP 范围",
    prompt: "如果 2 周内只做一个最小版本，你希望它先解决什么？",
    hint: "例如：只做去 AI 腔，不做选题、不做排版。",
  },
  {
    key: "risks",
    title: "风险约束",
    prompt: "有没有合规、数据、平台规则或大厂覆盖风险？",
    hint: "例如：涉及个人信息、内容审核、模型幻觉。",
  },
  {
    key: "validationEvidence",
    title: "验证计划",
    prompt: "你准备怎么验证这是不是个真需求？",
    hint: "例如：找 5 个目标用户访谈，做一个原型看他们是否愿意付费。",
  },
];

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" ? (value as Record<string, unknown>) : {};
}

function text(value: unknown) {
  return typeof value === "string" ? value : "";
}

function textArray(value: unknown) {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

function numberOrZero(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

function hasText(value: unknown) {
  return text(value).trim().length >= 4;
}

function isMissing(value: unknown) {
  return !hasText(value);
}

function includesAny(value: unknown, keywords: string[]) {
  const haystack = text(value).toLowerCase();
  return keywords.some((keyword) => haystack.includes(keyword.toLowerCase()));
}

function joinText(...parts: unknown[]) {
  return parts.map(text).filter(Boolean).join("；");
}

function researchSummary(research: ResearchState) {
  if (!research.items.length) return research.summary;
  const top = research.items.slice(0, 3).map((item) => `${item.title}（${item.source}）`).join("；");
  return [research.summary, top].filter(Boolean).join("\n");
}

function firstNonEmpty(...values: unknown[]) {
  for (const value of values) {
    const current = text(value).trim();
    if (current) return current;
  }
  return "";
}

export function createEmptyFields(): RequirementFields {
  return {
    idea: "",
    targetUser: "",
    contextPain: "",
    currentAlternative: "",
    competitors: "",
    frequency: "",
    willingnessToPay: "",
    researchNotes: "",
    mvpScope: "",
    risks: "",
    validationEvidence: "",
    scenario: "",
    painPoint: "",
  };
}

export function createEmptyResearch(): ResearchState {
  return {
    status: "idle",
    query: "",
    items: [],
    summary: "",
  };
}

export function createSeedSession(idea = ""): RequirementSession {
  const now = new Date().toISOString();
  return {
    id: `session_${Date.now()}`,
    createdAt: now,
    updatedAt: now,
    idea,
    fields: { ...createEmptyFields(), idea },
    messages: [],
    score: {
      total: 0,
      realScenario: 0,
      frequency: 0,
      alternativeCost: 0,
      willingnessToPay: 0,
      mvpFeasibility: 0,
      differentiation: 0,
      riskControl: 0,
    },
    evaluation: {
      verdict: "风险较高，需要继续访谈",
      summary: "等待更多信息后再判断。",
      reasons: [],
      missingInfo: [],
      redFlags: [],
    },
    prd: "",
    validationPlan: "",
    research: createEmptyResearch(),
    status: "collecting",
  };
}

export function normalizeFields(value: unknown): RequirementFields {
  const raw = asRecord(value);
  return {
    ...createEmptyFields(),
    idea: text(raw.idea),
    targetUser: text(raw.targetUser),
    contextPain: firstNonEmpty(raw.contextPain, raw.scenario, raw.painPoint),
    currentAlternative: text(raw.currentAlternative),
    competitors: text(raw.competitors),
    frequency: text(raw.frequency),
    willingnessToPay: text(raw.willingnessToPay),
    researchNotes: text(raw.researchNotes),
    mvpScope: text(raw.mvpScope),
    risks: text(raw.risks),
    validationEvidence: text(raw.validationEvidence),
    scenario: text(raw.scenario),
    painPoint: text(raw.painPoint),
  };
}

function normalizeResearch(value: unknown): ResearchState {
  const raw = asRecord(value);
  const status = raw.status === "searching" || raw.status === "ready" || raw.status === "error" ? raw.status : "idle";
  const items: ResearchItem[] = Array.isArray(raw.items)
    ? raw.items
        .map((item) => asRecord(item))
        .map((item) => ({
          title: text(item.title),
          url: text(item.url),
          snippet: text(item.snippet),
          source: text(item.source) || "网页",
          kind: (item.kind === "competitor" || item.kind === "alternative" || item.kind === "evidence" ? item.kind : "evidence") as ResearchItem["kind"],
        }))
        .filter((item) => item.title || item.url || item.snippet)
    : [];

  return {
    status,
    query: text(raw.query),
    items,
    summary: text(raw.summary),
    error: text(raw.error) || undefined,
    updatedAt: text(raw.updatedAt) || undefined,
  };
}

function normalizeScore(value: unknown): DemandScore {
  const raw = asRecord(value);
  return {
    total: numberOrZero(raw.total),
    realScenario: numberOrZero(raw.realScenario),
    frequency: numberOrZero(raw.frequency),
    alternativeCost: numberOrZero(raw.alternativeCost),
    willingnessToPay: numberOrZero(raw.willingnessToPay),
    mvpFeasibility: numberOrZero(raw.mvpFeasibility),
    differentiation: numberOrZero(raw.differentiation),
    riskControl: numberOrZero(raw.riskControl),
  };
}

function normalizeEvaluation(value: unknown): DemandEvaluation {
  const raw = asRecord(value);
  const verdicts: DemandEvaluation["verdict"][] = [
    "优先做，进入 MVP",
    "可以验证，但先不要重开发",
    "风险较高，需要继续访谈",
    "大概率伪需求，建议换方向或缩小范围",
  ];
  const verdict = verdicts.includes(raw.verdict as DemandEvaluation["verdict"]) ? (raw.verdict as DemandEvaluation["verdict"]) : "风险较高，需要继续访谈";

  return {
    verdict,
    summary: text(raw.summary) || "等待更多信息后再判断。",
    reasons: textArray(raw.reasons),
    missingInfo: textArray(raw.missingInfo),
    redFlags: textArray(raw.redFlags),
  };
}

function normalizeMessages(value: unknown): Message[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item, index) => ({ item: asRecord(item), index }))
    .map(({ item, index }) => ({
      id: text(item.id) || `m_${Date.now()}_${index}`,
      role: (item.role === "user" || item.role === "system" ? item.role : "assistant") as MessageRole,
      content: text(item.content),
      createdAt: text(item.createdAt) || new Date().toISOString(),
    }))
    .filter((item) => item.content);
}

export function normalizeSession(value: unknown): RequirementSession {
  const raw = asRecord(value);
  const fields = normalizeFields(raw.fields);
  const idea = firstNonEmpty(raw.idea, fields.idea);
  const now = new Date().toISOString();

  return {
    id: text(raw.id) || `session_${Date.now()}`,
    createdAt: text(raw.createdAt) || now,
    updatedAt: text(raw.updatedAt) || now,
    idea,
    fields: { ...fields, idea: fields.idea || idea },
    messages: normalizeMessages(raw.messages),
    score: normalizeScore(raw.score),
    evaluation: normalizeEvaluation(raw.evaluation),
    prd: text(raw.prd),
    validationPlan: text(raw.validationPlan),
    research: normalizeResearch(raw.research),
    status: raw.status === "ready" || raw.status === "done" ? raw.status : "collecting",
  };
}

export function getMissingFields(fields: RequirementFields) {
  return QUESTION_ORDER.filter((question) => isMissing(fields[question.key]));
}

function createQuestionText(question: Question, fields: RequirementFields) {
  const known = [
    fields.idea ? `当前想法：${fields.idea}` : "",
    fields.targetUser ? `已知用户：${fields.targetUser}` : "",
    fields.contextPain ? `已知场景/痛点：${fields.contextPain}` : "",
  ].filter(Boolean);

  const prefix = known.length ? `${known.join("；")}。` : "";
  return `${prefix}${question.prompt}${question.hint ? `\n${question.hint}` : ""}`.trim();
}

export function buildResearchQuery(session: RequirementSession) {
  const idea = session.fields.idea || session.idea || "AI 产品";
  const user = session.fields.targetUser || "目标用户";
  const context = firstNonEmpty(session.fields.contextPain, session.fields.scenario, session.fields.painPoint) || "场景与痛点";
  return `${idea} ${user} ${context}`.trim();
}

export function shouldTriggerResearch(session: RequirementSession) {
  return Boolean(text(session.fields.idea).trim()) && session.research.status === "idle";
}

export function attachResearch(session: RequirementSession, research: ResearchState) {
  const altItems = research.items.filter((item) => item.kind === "alternative");
  const competitorItems = research.items.filter((item) => item.kind === "competitor");
  const altText = altItems.slice(0, 3).map((item) => `${item.title}：${item.snippet}`).join("；");
  const compText = competitorItems.slice(0, 3).map((item) => `${item.title}：${item.snippet}`).join("；");

  return {
    ...session,
    research,
    fields: {
      ...session.fields,
      currentAlternative: altText || session.fields.currentAlternative,
      competitors: compText || session.fields.competitors,
      researchNotes: [researchSummary(research), compText].filter(Boolean).join("\n"),
    },
    updatedAt: new Date().toISOString(),
  };
}

export function analyzeRequirement(session: RequirementSession): DraftBundle {
  const fields = session.fields;
  const missing = getMissingFields(fields);
  const reasons: string[] = [];
  const redFlags: string[] = [];
  const pain = firstNonEmpty(fields.contextPain, fields.scenario, fields.painPoint);
  const researchText = joinText(fields.researchNotes, fields.currentAlternative, fields.competitors, session.research.summary);

  const realScenario = clamp(20 - (isMissing(fields.targetUser) ? 8 : 0) - (isMissing(pain) ? 6 : 0), 0, 20);
  const frequency = clamp(includesAny(joinText(fields.frequency, pain), ["每天", "每周", "高频", "反复", "频繁"]) ? 18 : 8, 0, 20);
  const alternativeCost = clamp(includesAny(researchText, ["代写", "代做", "人工", "请人", "自己改", "手动", "花时间", "花钱", "工具", "模板"]) ? 14 : 7, 0, 15);
  const willingnessToPay = clamp(includesAny(fields.willingnessToPay, ["月付", "元", "付费", "买", "愿意", "次", "年卡"]) ? 14 : 6, 0, 15);
  const mvpFeasibility = clamp(includesAny(fields.mvpScope, ["2 周", "两周", "最小", "一个", "只做", "MVP"]) ? 13 : 7, 0, 15);
  const differentiation = clamp(includesAny(joinText(researchText, pain, fields.currentAlternative), ["通用", "不好用", "太泛", "太复杂", "太贵", "限流", "不准", "垂直", "替代"]) ? 8 : 5, 0, 10);
  const riskControl = clamp(includesAny(fields.risks, ["合规", "隐私", "审核", "平台", "大厂", "数据"]) ? 4 : 2, 0, 5);

  if (isMissing(fields.targetUser)) reasons.push("目标用户还不够具体，容易把产品做成泛需求。");
  if (isMissing(pain)) reasons.push("缺少具体场景与摩擦，无法判断痛点是否真实发生。");
  if (isMissing(fields.willingnessToPay)) reasons.push("缺少付费或时间成本证据，变现判断不稳。");
  if (isMissing(fields.mvpScope)) reasons.push("MVP 范围没有收紧，容易做成大而全。");
  if (isMissing(fields.validationEvidence)) reasons.push("还没有明确验证方式，无法快速证明真需求。");

  if (includesAny(joinText(pain, fields.idea), ["提升效率", "赋能", "通用", "所有人"])) {
    redFlags.push("描述偏空泛，建议改成具体行为和具体场景。");
  }
  if (includesAny(researchText, ["大厂", "微信", "豆包", "Kimi", "通义"])) {
    redFlags.push("竞品覆盖较强，需要明确你的垂直差异化。");
  }
  if (includesAny(fields.risks, ["个人信息", "隐私", "内容审核"])) {
    redFlags.push("涉及数据和内容合规，后续需要先定边界。");
  }

  if (session.research.items.length > 0 && !fields.currentAlternative) {
    reasons.push("已自动联网搜索到替代服务和竞品，可以直接用这些证据继续收敛。");
  }

  const total = realScenario + frequency + alternativeCost + willingnessToPay + mvpFeasibility + differentiation + riskControl;

  let verdict: DemandEvaluation["verdict"] = "大概率伪需求，建议换方向或缩小范围";
  if (total >= 80) verdict = "优先做，进入 MVP";
  else if (total >= 60) verdict = "可以验证，但先不要重开发";
  else if (total >= 40) verdict = "风险较高，需要继续访谈";

  const summaryMap: Record<DemandEvaluation["verdict"], string> = {
    "优先做，进入 MVP": "需求信号较强，已经具备进入最小版本验证的基础。",
    "可以验证，但先不要重开发": "方向有希望，但还需要少量访谈和证据补齐。",
    "风险较高，需要继续访谈": "目前证据还不够硬，建议继续补足场景、替代方案和付费信息。",
    "大概率伪需求，建议换方向或缩小范围": "当前描述太泛或证据太弱，不建议直接开工。",
  };

  const nextQuestions = missing.slice(0, 3).map((question) => ({
    ...question,
    prompt: createQuestionText(question, fields),
  }));

  return {
    evaluation: {
      verdict,
      summary: summaryMap[verdict],
      reasons: reasons.length ? reasons : ["基础信息已较完整，可以继续往 PRD 收敛。"],
      missingInfo: missing.map((item) => item.title),
      redFlags: redFlags.length ? redFlags : ["暂无明显红旗，但仍需要用真实用户访谈验证。"],
    },
    score: {
      total,
      realScenario,
      frequency,
      alternativeCost,
      willingnessToPay,
      mvpFeasibility,
      differentiation,
      riskControl,
    },
    prd: buildPrd(session, total, verdict, reasons, redFlags),
    validationPlan: buildValidationPlan(session, total, verdict),
    nextQuestions,
  };
}

function buildPrd(session: RequirementSession, score: number, verdict: DemandEvaluation["verdict"], reasons: string[], redFlags: string[]) {
  const f = session.fields;
  const idea = f.idea || session.idea || "待确认产品方向";
  const user = f.targetUser || "待确认目标用户";
  const pain = firstNonEmpty(f.contextPain, f.scenario, f.painPoint) || "待补充";
  const alt = f.currentAlternative || f.competitors || (session.research.summary ? session.research.summary : "待补充");
  const researchBlock = f.researchNotes ? [`## 3. 联网研究回填`, f.researchNotes, ``].join("\n") : "";

  return [
    `# PRD 草稿`,
    ``,
    `## 1. 产品一句话定位`,
    `${idea}，面向 ${user}，帮助用户在具体场景中把需求转成可验证的产品方案。`,
    ``,
    `## 2. 目标用户画像`,
    `- ${user}`,
    `- 使用场景与痛点：${pain}`,
    `- 当前替代方案：${alt}`,
    ``,
    `## 3. 核心痛点`,
    `${pain}`,
    researchBlock,
    `## 4. MVP 范围`,
    `${f.mvpScope || "先收敛到 3 个核心功能以内"}`,
    ``,
    `## 5. 非 MVP 范围`,
    `- 不做泛化大而全能力`,
    `- 不做复杂运营后台`,
    `- 不做与当前验证无关的附加功能`,
    ``,
    `## 6. 页面结构`,
    `- 首页/工作台`,
    `- 需求访谈区`,
    `- 评分与风险区`,
    `- PRD 预览区`,
    `- 验证计划区`,
    ``,
    `## 7. 核心交互流程`,
    `1. 用户输入一句话想法`,
    `2. 系统追问目标用户、场景与事实证据`,
    `3. 系统自动联网搜索竞品和替代服务`,
    `4. 系统判断真伪需求`,
    `5. 系统生成 PRD 与验证方案`,
    ``,
    `## 8. 数据字段`,
    `- idea`,
    `- targetUser`,
    `- contextPain`,
    `- currentAlternative`,
    `- competitors`,
    `- frequency`,
    `- willingnessToPay`,
    `- researchNotes`,
    `- mvpScope`,
    `- risks`,
    `- validationEvidence`,
    ``,
    `## 9. AI Prompt / 模型调用需求`,
    `- 输入必须结构化 JSON`,
    `- 输出必须包含下一轮问题、评分、红旗、PRD、验证计划`,
    `- 联网研究结果要先回填再让用户确认`,
    `- 所有追问必须围绕行为事实`,
    ``,
    `## 10. 验收标准`,
    `- 能把模糊想法追问到可开发级别`,
    `- 能自动回填竞品/替代服务并允许用户修正`,
    `- 能识别伪需求风险`,
    `- 能生成可复制的 72 小时验证计划`,
    ``,
    `## 11. 风险与约束`,
    `- 评分：${score}/100`,
    `- 结论：${verdict}`,
    reasons.length ? `- 需要补充：${reasons.join("；")}` : "- 需要补充：暂无",
    redFlags.length ? `- 红旗：${redFlags.join("；")}` : "- 红旗：暂无",
  ]
    .filter(Boolean)
    .join("\n");
}

function buildValidationPlan(session: RequirementSession, score: number, verdict: DemandEvaluation["verdict"]) {
  const f = session.fields;
  return [
    `# 72 小时验证计划`,
    ``,
    `## Day 1：找目标用户`,
    `- 在微信、社群、朋友圈或垂直平台寻找 5-10 个目标用户`,
    `- 用事实问题访谈：上次什么时候发生、现在怎么凑合、花了多少时间/钱`,
    `- 记录用户原话与替代方案`,
    ``,
    `## Day 2：原型或人工服务测试`,
    `- 做一个最小原型或人工代工服务`,
    `- 只保留 3 个核心功能`,
    `- 观察用户是否愿意真实操作`,
    ``,
    `## Day 3：付费意愿验证`,
    `- 设计预售页、意向金、或人工交付报价`,
    `- 测试用户是否愿意留下联系方式或付款`,
    `- 设定通过标准：有明确意向金、预约、或可重复使用行为`,
    ``,
    `## 成功/失败判断`,
    `- 评分：${score}/100`,
    `- 当前结论：${verdict}`,
    `- 如果没有替代方案和付费证据，先不要进入重开发`,
    ``,
    `## Pivot 建议`,
    `- 如果 ${f.targetUser || "当前用户"} 不愿意付费，缩小到更高频的细分场景`,
    `- 如果场景不清晰，回到具体行为而不是抽象诉求`,
  ].join("\n");
}

export function createInitialMessage(idea?: string): Message {
  return {
    id: `m_${Date.now()}_assistant`,
    role: "assistant",
    content: idea
      ? `我先收到了你的想法：${idea}。接下来我会逐步追问目标用户、场景和事实证据，再帮你收敛成 PRD。`
      : "先给我一句话想法，我会开始帮你补齐缺失信息。",
    createdAt: new Date().toISOString(),
  };
}

export function createUserMessage(content: string): Message {
  return {
    id: `m_${Date.now()}_user`,
    role: "user",
    content,
    createdAt: new Date().toISOString(),
  };
}

export function buildNextAssistantMessage(bundle: DraftBundle) {
  if (bundle.nextQuestions.length === 0) {
    return {
      kind: "ready" as const,
      content: `信息已经足够，我开始整理 PRD 和验证计划。当前判断：${bundle.evaluation.verdict}。`,
    };
  }

  const prompts = bundle.nextQuestions.slice(0, 3).map((question, index) => `${index + 1}. ${question.title}：${question.prompt}`);
  return {
    kind: "question" as const,
    content: `我还缺这几个关键点，先补最重要的：\n${prompts.join("\n")}`,
    questions: bundle.nextQuestions,
  };
}

export function applyUserAnswer(session: RequirementSession, answer: string) {
  const fields = { ...session.fields };
  const missing = getMissingFields(fields);
  const currentQuestion = missing[0];
  const trimmed = answer.trim();

  if (currentQuestion) {
    fields[currentQuestion.key] = trimmed;
  } else if (!hasText(fields.idea)) {
    fields.idea = trimmed;
  } else {
    fields.validationEvidence = [fields.validationEvidence, trimmed].filter(Boolean).join("；");
  }

  return {
    ...session,
    fields,
    idea: fields.idea || session.idea,
    updatedAt: new Date().toISOString(),
  };
}

export function finalizeSession(session: RequirementSession): RequirementSession {
  const bundle = analyzeRequirement(session);
  return {
    ...session,
    updatedAt: new Date().toISOString(),
    score: bundle.score,
    evaluation: bundle.evaluation,
    prd: bundle.prd,
    validationPlan: bundle.validationPlan,
    status: bundle.nextQuestions.length === 0 ? "done" : "ready",
  };
}
