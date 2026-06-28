export type Goals = {
  longTerm: string;
  stage: string;
  dailyFocus: string;
  createdAt: string;
};

export type YesterdayActionCheck = {
  id: string;
  title: string;
  completed: boolean;
  reason: string;
};

export type TomorrowAction = {
  id: string;
  title: string;
  alignedTo: string;
  antiMistake: string;
  priority: 1 | 2 | 3;
  isMostImportant: boolean;
};

export type DailyReviewInput = {
  date: string;
  keyEvents: string;
  mistakes: string;
  advancedImportantGoal: boolean;
  driftReason: string;
  tomorrowDirection: string;
  yesterdayActions: YesterdayActionCheck[];
};

export type DailyReviewRecord = {
  id: string;
  date: string;
  createdAt: string;
  goalsSnapshot: Goals;
  keyEvents: string[];
  mistakes: string[];
  drift: {
    drifted: boolean;
    summary: string;
    reason: string;
  };
  yesterdaySummary: string;
  tomorrowActions: TomorrowAction[];
  repeatedPattern: string;
  positiveFeedback: string;
};

export type WeeklyReview = {
  id: string;
  weekLabel: string;
  generatedAt: string;
  production: string[];
  repeatedProblems: string[];
  driftSummary: string;
  nextFocus: string[];
  insight: string;
};

const patternMap = [
  {
    keys: ["工具", "设计细节", "细节", "选择"],
    label: "被工具选择或细节打断主线"
  },
  { keys: ["发散", "偏航", "带偏"], label: "发散后没有及时拉回核心目标" },
  { keys: ["逃避", "拖延", "失约"], label: "对关键任务出现逃避或拖延" },
  { keys: ["忙", "杂事", "临时"], label: "用忙碌掩盖核心目标推进不足" }
];

export function formatToday(date = new Date()) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function generateDailyReview(
  input: DailyReviewInput,
  goals: Goals,
  previousRecords: DailyReviewRecord[]
): DailyReviewRecord {
  const keyEvents = splitIntoItems(input.keyEvents, "今天有一个关键事件：先把注意力放回核心目标。");
  const mistakes = splitIntoItems(input.mistakes, "今天没有记录明显错误，但仍要留意是否真的推进了核心目标。");
  const yesterdaySummary = summarizeYesterday(input.yesterdayActions);
  const drifted = !input.advancedImportantGoal;
  const driftReason = input.driftReason.trim();
  const driftSummary = drifted
    ? `今天有偏航：${driftReason || "没有推进最重要目标，需要明天补回一个最小动作。"}`
    : "今天推进了最重要目标，方向基本对齐。";
  const repeatedPattern = detectRepeatedPattern(mistakes, input.driftReason, previousRecords);
  const tomorrowActions = buildTomorrowActions(input, goals, mistakes);

  return {
    id: `review-${Date.now()}`,
    date: input.date,
    createdAt: new Date().toISOString(),
    goalsSnapshot: goals,
    keyEvents,
    mistakes,
    drift: {
      drifted,
      summary: driftSummary,
      reason: driftReason || (drifted ? "未推进最重要目标" : "已推进最重要目标")
    },
    yesterdaySummary,
    tomorrowActions,
    repeatedPattern,
    positiveFeedback: buildPositiveFeedback(input, drifted, mistakes)
  };
}

export function generateWeeklyReview(records: DailyReviewRecord[], goals: Goals): WeeklyReview {
  const recent = records.slice(0, 7);
  const generatedAt = new Date().toISOString();
  const driftedCount = recent.filter((record) => record.drift.drifted).length;
  const repeatedProblems = collectRepeatedProblems(recent);
  const nextFocus = recent[0]?.tomorrowActions.slice(0, 3).map((action) => action.title) ?? [
    goals.dailyFocus
  ];

  return {
    id: `weekly-${Date.now()}`,
    weekLabel: buildWeekLabel(new Date()),
    generatedAt,
    production: recent.length
      ? recent.map((record) => `${record.date}：${record.keyEvents[0]}`)
      : ["本周还没有足够记录，先完成今天的复盘。"],
    repeatedProblems,
    driftSummary:
      driftedCount > 0
        ? `本周 ${driftedCount}/${recent.length} 次出现偏航，优先处理最常重复的阻碍。`
        : "本周记录里的核心动作基本对齐，没有明显连续偏航。",
    nextFocus,
    insight:
      repeatedProblems[0] && !repeatedProblems[0].includes("暂未")
        ? `下周最值得处理的是：${repeatedProblems[0]}。把它压缩成每天能开始的最小动作。`
        : `保持每天围绕「${goals.dailyFocus}」做一个小但真实的推进。`
  };
}

export function buildMarkdownExport(
  goals: Goals | null,
  records: DailyReviewRecord[],
  weeklyReviews: WeeklyReview[]
) {
  const lines = ["# 个人复盘导出", ""];

  if (goals) {
    lines.push("## 长期目标", "");
    lines.push(`- 人生方向 / 年度目标：${goals.longTerm}`);
    lines.push(`- 未来 1-3 个月阶段目标：${goals.stage}`);
    lines.push(`- 每天重点行动方向：${goals.dailyFocus}`);
    lines.push("");
  }

  lines.push("## 每日复盘", "");
  records.forEach((record) => {
    lines.push(`### ${record.date}`);
    lines.push("");
    lines.push(`- ${record.yesterdaySummary}`);
    lines.push(`- 是否偏航：${record.drift.drifted ? "是" : "否"}，${record.drift.summary}`);
    lines.push(`- 重复模式：${record.repeatedPattern}`);
    lines.push(`- 正向反馈：${record.positiveFeedback}`);
    lines.push("- 明天行动：");
    record.tomorrowActions.forEach((action) => {
      lines.push(
        `  - P${action.priority}${action.isMostImportant ? " / 明天最重要动作" : ""}：${action.title}（防错提醒：${action.antiMistake}）`
      );
    });
    lines.push("");
  });

  if (weeklyReviews.length) {
    lines.push("## 周复盘", "");
    weeklyReviews.forEach((review) => {
      lines.push(`### ${review.weekLabel}`);
      lines.push(`- 是否偏航：${review.driftSummary}`);
      lines.push(`- 成长洞察：${review.insight}`);
      lines.push("- 下周重点：");
      review.nextFocus.forEach((focus) => lines.push(`  - ${focus}`));
      lines.push("");
    });
  }

  return lines.join("\n");
}

export function calculateStreak(records: DailyReviewRecord[], today = formatToday()) {
  const uniqueDates = Array.from(new Set(records.map((record) => record.date))).sort().reverse();
  if (!uniqueDates.length) return 0;

  let streak = 0;
  let cursor = new Date(`${today}T00:00:00`);

  for (const date of uniqueDates) {
    const cursorText = formatToday(cursor);
    if (date === cursorText) {
      streak += 1;
      cursor.setDate(cursor.getDate() - 1);
      continue;
    }
    if (streak === 0 && date > cursorText) continue;
    break;
  }

  return streak;
}

function splitIntoItems(text: string, fallback: string) {
  const items = text
    .split(/\n|；|;|。/)
    .map((item) => item.trim())
    .filter(Boolean);

  return items.length ? items.slice(0, 4) : [fallback];
}

function summarizeYesterday(actions: YesterdayActionCheck[]) {
  if (!actions.length) return "今天是第一天复盘，还没有昨日行动需要核对。";

  const completed = actions.filter((action) => action.completed).length;
  const missed = actions.filter((action) => !action.completed);
  if (!missed.length) return `昨日 ${completed}/${actions.length} 个行动完成。`;

  const firstReason = missed[0]?.reason.trim();
  return `昨日 ${completed}/${actions.length} 个行动完成，未完成原因：${firstReason || "需要把任务拆得更小、更具体。"}。`;
}

function buildTomorrowActions(
  input: DailyReviewInput,
  goals: Goals,
  mistakes: string[]
): TomorrowAction[] {
  const directions = splitIntoItems(input.tomorrowDirection, goals.dailyFocus).slice(0, 3);
  const antiMistake = buildAntiMistake([...mistakes, input.driftReason].join(" "));

  return directions.map((direction, index) => ({
    id: `action-${Date.now()}-${index}`,
    title: normalizeActionTitle(direction, goals),
    alignedTo: index === 0 ? goals.stage : goals.dailyFocus,
    antiMistake,
    priority: (index + 1) as 1 | 2 | 3,
    isMostImportant: index === 0
  }));
}

function normalizeActionTitle(direction: string, goals: Goals) {
  const clean = direction.replace(/[。.!！]$/g, "").trim();
  if (!clean) return `完成一个能推进「${goals.dailyFocus}」的最小动作`;
  if (/^(完成|写完|发布|验证|整理|联系|输出|修复|确定|提交|上线)/.test(clean)) return clean;
  return `完成：${clean}`;
}

function buildAntiMistake(text: string) {
  if (/工具|设计细节|细节|选择/.test(text)) return "先完成可交付版本，再处理工具和设计细节。";
  if (/发散|偏航|带偏/.test(text)) return "开始前写下唯一目标，中途想发散时先记录到待处理清单。";
  if (/逃避|拖延|失约/.test(text)) return "把任务缩到 25 分钟内可以开始，不用等状态完美。";
  return "先做最小可验证动作，避免把任务扩大。";
}

function detectRepeatedPattern(
  mistakes: string[],
  driftReason: string,
  previousRecords: DailyReviewRecord[]
) {
  const currentText = [...mistakes, driftReason].join(" ");
  for (const pattern of patternMap) {
    const appearsNow = pattern.keys.some((key) => currentText.includes(key));
    const appearedBefore = previousRecords.some((record) =>
      pattern.keys.some((key) => `${record.mistakes.join(" ")} ${record.drift.reason}`.includes(key))
    );

    if (appearsNow && appearedBefore) return `重复模式：${pattern.label}。这次要把明天动作压小，并先交付核心结果。`;
    if (appearsNow) return `需要警惕：${pattern.label}。`;
  }

  return "暂未看到明显重复模式，继续积累记录后会更容易识别。";
}

function buildPositiveFeedback(input: DailyReviewInput, drifted: boolean, mistakes: string[]) {
  if (drifted) return "今天最值得肯定的是你没有用忙碌掩盖偏航，而是把问题重新拉回了核心目标。";
  if (mistakes.length) return "今天能把错误具体说出来，本身就是在减少下一次重复犯错的概率。";
  return "今天保持了对核心目标的推进，最值得保留的是这种小步但真实的前进。";
}

function collectRepeatedProblems(records: DailyReviewRecord[]) {
  if (!records.length) return ["暂未形成周复盘样本。"];

  const found = patternMap
    .filter((pattern) => {
      const count = records.filter((record) =>
        pattern.keys.some((key) =>
          `${record.mistakes.join(" ")} ${record.drift.reason} ${record.repeatedPattern}`.includes(key)
        )
      ).length;
      return count >= 1;
    })
    .map((pattern) => pattern.label);

  return found.length ? found.slice(0, 3) : ["暂未看到高频重复问题，继续保持每日记录。"];
}

function buildWeekLabel(date: Date) {
  const end = new Date(date);
  const start = new Date(date);
  start.setDate(end.getDate() - 6);
  return `${formatToday(start)} 至 ${formatToday(end)}`;
}
