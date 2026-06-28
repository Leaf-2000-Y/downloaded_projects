"use client";

import {
  AlertTriangle,
  CalendarCheck,
  CheckCircle2,
  ClipboardCheck,
  Download,
  Flag,
  ListChecks,
  RefreshCcw,
  Sparkles,
  Target,
  Trophy
} from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  DailyReviewRecord,
  Goals,
  WeeklyReview,
  YesterdayActionCheck,
  buildMarkdownExport,
  calculateStreak,
  formatToday,
  generateDailyReview,
  generateWeeklyReview
} from "./review-engine";

const storageKeys = {
  goals: "personal-review-assistant:goals",
  records: "personal-review-assistant:records",
  weekly: "personal-review-assistant:weekly"
};

type ReviewFormState = {
  keyEvents: string;
  mistakes: string;
  advancedImportantGoal: boolean;
  driftReason: string;
  tomorrowDirection: string;
};

const emptyReviewForm: ReviewFormState = {
  keyEvents: "",
  mistakes: "",
  advancedImportantGoal: false,
  driftReason: "",
  tomorrowDirection: ""
};

export default function Home() {
  const [hydrated, setHydrated] = useState(false);
  const [goals, setGoals] = useState<Goals | null>(null);
  const [records, setRecords] = useState<DailyReviewRecord[]>([]);
  const [weeklyReviews, setWeeklyReviews] = useState<WeeklyReview[]>([]);
  const [currentCard, setCurrentCard] = useState<DailyReviewRecord | null>(null);
  const [goalDraft, setGoalDraft] = useState({
    longTerm: "",
    stage: "",
    dailyFocus: ""
  });
  const [reviewForm, setReviewForm] = useState<ReviewFormState>(emptyReviewForm);
  const [yesterdayChecks, setYesterdayChecks] = useState<YesterdayActionCheck[]>([]);

  const latestRecord = records[0] ?? null;
  const latestWeekly = weeklyReviews[0] ?? null;
  const streak = useMemo(() => calculateStreak(records), [records]);

  useEffect(() => {
    const savedGoals = readStorage<Goals>(storageKeys.goals);
    const savedRecords = readStorage<DailyReviewRecord[]>(storageKeys.records) ?? [];
    const savedWeekly = readStorage<WeeklyReview[]>(storageKeys.weekly) ?? [];

    setGoals(savedGoals);
    if (savedGoals) {
      setGoalDraft({
        longTerm: savedGoals.longTerm,
        stage: savedGoals.stage,
        dailyFocus: savedGoals.dailyFocus
      });
    }
    setRecords(savedRecords);
    setCurrentCard(savedRecords[0] ?? null);
    setWeeklyReviews(savedWeekly);
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    if (goals) localStorage.setItem(storageKeys.goals, JSON.stringify(goals));
  }, [goals, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(storageKeys.records, JSON.stringify(records));
  }, [records, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(storageKeys.weekly, JSON.stringify(weeklyReviews));
  }, [weeklyReviews, hydrated]);

  useEffect(() => {
    if (!latestRecord) {
      setYesterdayChecks([]);
      return;
    }

    setYesterdayChecks(
      latestRecord.tomorrowActions.map((action) => ({
        id: action.id,
        title: action.title,
        completed: false,
        reason: ""
      }))
    );
  }, [latestRecord?.id]);

  function handleGoalSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextGoals: Goals = {
      longTerm: goalDraft.longTerm.trim(),
      stage: goalDraft.stage.trim(),
      dailyFocus: goalDraft.dailyFocus.trim(),
      createdAt: new Date().toISOString()
    };
    setGoals(nextGoals);
  }

  function handleReviewSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!goals) return;

    const record = generateDailyReview(
      {
        date: formatToday(),
        keyEvents: reviewForm.keyEvents,
        mistakes: reviewForm.mistakes,
        advancedImportantGoal: reviewForm.advancedImportantGoal,
        driftReason: reviewForm.driftReason,
        tomorrowDirection: reviewForm.tomorrowDirection,
        yesterdayActions: yesterdayChecks
      },
      goals,
      records
    );

    setRecords((previous) => [record, ...previous]);
    setCurrentCard(record);
    setReviewForm(emptyReviewForm);
  }

  function handleWeeklyReview() {
    if (!goals) return;
    const review = generateWeeklyReview(records, goals);
    setWeeklyReviews((previous) => [review, ...previous]);
  }

  function handleMarkdownExport() {
    const markdown = buildMarkdownExport(goals, records, weeklyReviews);
    const blob = new Blob([markdown], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `personal-review-${formatToday()}.md`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 0);
  }

  function handleReset() {
    localStorage.removeItem(storageKeys.goals);
    localStorage.removeItem(storageKeys.records);
    localStorage.removeItem(storageKeys.weekly);
    setGoals(null);
    setRecords([]);
    setWeeklyReviews([]);
    setCurrentCard(null);
    setGoalDraft({ longTerm: "", stage: "", dailyFocus: "" });
    setReviewForm(emptyReviewForm);
  }

  if (!hydrated) {
    return (
      <main className="app-shell">
        <section className="surface loading-state" aria-label="加载中">
          <Sparkles size={24} aria-hidden="true" />
          <p>正在读取本地复盘记录...</p>
        </section>
      </main>
    );
  }

  if (!goals) {
    return (
      <main className="setup-shell">
        <section className="setup-panel" aria-labelledby="setup-title">
          <p className="eyebrow">Personal Review Assistant</p>
          <h1 id="setup-title">先把复盘的北极星定下来</h1>
          <p className="setup-copy">
            第一版只需要三个层级：长期方向、阶段目标、每天该对齐的行动方向。
          </p>

          <form className="stack-form" onSubmit={handleGoalSubmit}>
            <Field
              id="long-term-goal"
              label="人生方向 / 年度目标"
              value={goalDraft.longTerm}
              onChange={(value) => setGoalDraft((draft) => ({ ...draft, longTerm: value }))}
              placeholder="例如：做出可持续的个人 AI 产品"
              required
            />
            <Field
              id="stage-goal"
              label="未来 1-3 个月阶段目标"
              value={goalDraft.stage}
              onChange={(value) => setGoalDraft((draft) => ({ ...draft, stage: value }))}
              placeholder="例如：上线 7 天可用的 MVP"
              required
            />
            <Field
              id="daily-focus"
              label="每天重点行动方向"
              value={goalDraft.dailyFocus}
              onChange={(value) => setGoalDraft((draft) => ({ ...draft, dailyFocus: value }))}
              placeholder="例如：每天推进一个可发布的小结果"
              required
            />
            <button className="primary-button" type="submit">
              <Target size={18} aria-hidden="true" />
              保存目标并开始复盘
            </button>
          </form>
        </section>
      </main>
    );
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">目标纠偏型 AI 复盘助手</p>
          <h1>个人复盘助手</h1>
        </div>
        <div className="topbar-actions">
          <div className="streak-pill" aria-label={`连续 ${streak} 天`}>
            <Trophy size={17} aria-hidden="true" />
            连续 {streak} 天
          </div>
          <button className="ghost-button" type="button" onClick={handleMarkdownExport}>
            <Download size={17} aria-hidden="true" />
            导出 Markdown
          </button>
          <button className="icon-button" type="button" onClick={handleReset} aria-label="重置本地数据">
            <RefreshCcw size={17} aria-hidden="true" />
          </button>
        </div>
      </header>

      <section className="dashboard-grid">
        <aside className="side-column">
          <section className="surface goal-card" aria-labelledby="goal-title">
            <div className="section-heading">
              <Flag size={18} aria-hidden="true" />
              <h2 id="goal-title">长期目标</h2>
            </div>
            <dl className="goal-list">
              <div>
                <dt>人生方向 / 年度目标</dt>
                <dd>{goals.longTerm}</dd>
              </div>
              <div>
                <dt>未来 1-3 个月</dt>
                <dd>{goals.stage}</dd>
              </div>
              <div>
                <dt>每日对齐方向</dt>
                <dd>{goals.dailyFocus}</dd>
              </div>
            </dl>
          </section>

          <section className="surface history-card" aria-labelledby="history-title">
            <div className="section-heading">
              <CalendarCheck size={18} aria-hidden="true" />
              <h2 id="history-title">最近复盘</h2>
            </div>
            {records.length ? (
              <ol className="history-list">
                {records.slice(0, 5).map((record) => (
                  <li key={record.id}>
                    <span>{record.date}</span>
                    <strong>{record.drift.drifted ? "有偏航" : "已对齐"}</strong>
                    <p>{record.tomorrowActions[0]?.title}</p>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="muted-copy">完成一次每日复盘后，这里会沉淀历史记录。</p>
            )}
          </section>
        </aside>

        <section className="main-column">
          <form className="surface review-form" onSubmit={handleReviewSubmit}>
            <div className="form-title-row">
              <div className="section-heading">
                <ClipboardCheck size={19} aria-hidden="true" />
                <h2>今日复盘</h2>
              </div>
              <span className="time-chip">5-8 分钟</span>
            </div>

            <section className="goal-reminder" aria-label="目标提醒">
              <strong>今天的判断标准</strong>
              <span>有没有推进「{goals.dailyFocus}」，哪怕只推进一点。</span>
            </section>

            <YesterdayActions
              checks={yesterdayChecks}
              onChange={(nextChecks) => setYesterdayChecks(nextChecks)}
            />

            <TextAreaField
              id="key-events"
              label="今天关键事件"
              value={reviewForm.keyEvents}
              onChange={(value) => setReviewForm((draft) => ({ ...draft, keyEvents: value }))}
              placeholder="写 1-3 件真正影响今天方向的事。"
              required
            />
            <TextAreaField
              id="mistakes"
              label="今天的问题 / 错误"
              value={reviewForm.mistakes}
              onChange={(value) => setReviewForm((draft) => ({ ...draft, mistakes: value }))}
              placeholder="写具体错误，不写生活流水账。"
              required
            />

            <label className="check-row focus-check">
              <input
                type="checkbox"
                checked={reviewForm.advancedImportantGoal}
                onChange={(event) =>
                  setReviewForm((draft) => ({
                    ...draft,
                    advancedImportantGoal: event.target.checked
                  }))
                }
              />
              <span>
                <strong>今天推进了最重要目标</strong>
                <small>不按忙不忙判断，只看有没有靠近真正重要的事。</small>
              </span>
            </label>

            <TextAreaField
              id="drift-reason"
              label="如果偏航，被什么带偏了"
              value={reviewForm.driftReason}
              onChange={(value) => setReviewForm((draft) => ({ ...draft, driftReason: value }))}
              placeholder="例如：被工具选择、设计细节、临时消息、逃避心理带偏。"
            />
            <TextAreaField
              id="tomorrow-direction"
              label="明天想推进的方向"
              value={reviewForm.tomorrowDirection}
              onChange={(value) =>
                setReviewForm((draft) => ({ ...draft, tomorrowDirection: value }))
              }
              placeholder="写明天 1-3 个想推进的具体结果。"
              required
            />

            <button className="primary-button" type="submit">
              <Sparkles size={18} aria-hidden="true" />
              生成复盘卡片
            </button>
          </form>

          {currentCard && <ReviewCard record={currentCard} />}
        </section>

        <aside className="side-column">
          <section className="surface weekly-card" aria-labelledby="weekly-title">
            <div className="section-heading">
              <ListChecks size={18} aria-hidden="true" />
              <h2 id="weekly-title">周复盘</h2>
            </div>
            <button
              className="secondary-button"
              type="button"
              onClick={handleWeeklyReview}
              disabled={!records.length}
            >
              <CalendarCheck size={17} aria-hidden="true" />
              生成周复盘
            </button>

            {latestWeekly ? (
              <div className="weekly-output">
                <h3>本周复盘</h3>
                <p className="muted-copy">{latestWeekly.weekLabel}</p>
                <h4>本周产出</h4>
                <ul>
                  {latestWeekly.production.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
                <h4>本周重复问题</h4>
                <ul>
                  {latestWeekly.repeatedProblems.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
                <h4>下周重点</h4>
                <ul>
                  {latestWeekly.nextFocus.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
                <p className="insight">{latestWeekly.insight}</p>
              </div>
            ) : (
              <p className="muted-copy">
                周复盘会从最近 7 天里找重复问题，再给出下周 1-3 个重点。
              </p>
            )}
          </section>
        </aside>
      </section>
    </main>
  );
}

function Field({
  id,
  label,
  value,
  onChange,
  placeholder,
  required
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  required?: boolean;
}) {
  return (
    <label className="field" htmlFor={id}>
      <span>{label}</span>
      <input
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        required={required}
      />
    </label>
  );
}

function TextAreaField({
  id,
  label,
  value,
  onChange,
  placeholder,
  required
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  required?: boolean;
}) {
  return (
    <label className="field" htmlFor={id}>
      <span>{label}</span>
      <textarea
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        required={required}
      />
    </label>
  );
}

function YesterdayActions({
  checks,
  onChange
}: {
  checks: YesterdayActionCheck[];
  onChange: (checks: YesterdayActionCheck[]) => void;
}) {
  if (!checks.length) {
    return (
      <section className="yesterday-box" aria-labelledby="yesterday-title">
        <div className="section-heading compact">
          <CheckCircle2 size={17} aria-hidden="true" />
          <h3 id="yesterday-title">昨日行动核对</h3>
        </div>
        <p className="muted-copy">今天是第一天，还没有昨日行动要核对。</p>
      </section>
    );
  }

  return (
    <section className="yesterday-box" aria-labelledby="yesterday-title">
      <div className="section-heading compact">
        <CheckCircle2 size={17} aria-hidden="true" />
        <h3 id="yesterday-title">昨日行动核对</h3>
      </div>
      <div className="check-list">
        {checks.map((check, index) => (
          <div className="action-check" key={check.id}>
            <label className="check-row">
              <input
                type="checkbox"
                checked={check.completed}
                onChange={(event) => {
                  const next = [...checks];
                  next[index] = { ...check, completed: event.target.checked };
                  onChange(next);
                }}
              />
              <span>{check.title}</span>
            </label>
            {!check.completed && (
              <input
                aria-label={`${check.title} 未完成原因`}
                value={check.reason}
                onChange={(event) => {
                  const next = [...checks];
                  next[index] = { ...check, reason: event.target.value };
                  onChange(next);
                }}
                placeholder="没完成的话，简单写原因"
              />
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

function ReviewCard({ record }: { record: DailyReviewRecord }) {
  return (
    <article className="surface review-card" aria-labelledby="card-title">
      <div className="form-title-row">
        <div className="section-heading">
          <Sparkles size={19} aria-hidden="true" />
          <h2 id="card-title">复盘卡片</h2>
        </div>
        <span className={record.drift.drifted ? "status-chip warning" : "status-chip success"}>
          {record.drift.drifted ? "有偏航" : "已对齐"}
        </span>
      </div>

      <p className="summary-line">{record.yesterdaySummary}</p>

      <div className="card-grid">
        <CardSection title="今天关键事件" items={record.keyEvents} />
        <CardSection title="今天的问题 / 错误" items={record.mistakes} />
      </div>

      <section className="drift-box">
        <AlertTriangle size={18} aria-hidden="true" />
        <div>
          <h3>是否偏航</h3>
          <p>{record.drift.summary}</p>
        </div>
      </section>

      <section className="actions-box">
        <h3>明天 1-3 个行动</h3>
        <ol>
          {record.tomorrowActions.map((action) => (
            <li key={action.id}>
              <div className="action-title-row">
                <strong>
                  {action.isMostImportant ? "明天最重要动作：" : `优先级 ${action.priority}：`}
                  {action.title}
                </strong>
              </div>
              <p>对齐目标：{action.alignedTo}</p>
              <p>防错提醒：{action.antiMistake}</p>
            </li>
          ))}
        </ol>
      </section>

      <div className="pattern-box">
        <strong>需要警惕的重复模式</strong>
        <p>{record.repeatedPattern}</p>
      </div>

      <div className="positive-box">
        <strong>个性化正向反馈</strong>
        <p>{record.positiveFeedback}</p>
      </div>
    </article>
  );
}

function CardSection({ title, items }: { title: string; items: string[] }) {
  return (
    <section className="mini-section">
      <h3>{title}</h3>
      <ul>
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </section>
  );
}

function readStorage<T>(key: string): T | null {
  try {
    const value = localStorage.getItem(key);
    return value ? (JSON.parse(value) as T) : null;
  } catch {
    return null;
  }
}
