"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  ClipboardCheck,
  Copy,
  FileText,
  Gauge,
  MessageSquareText,
  RefreshCcw,
  Search,
  Send,
  WandSparkles,
} from "lucide-react";
import {
  QUESTION_ORDER,
  analyzeRequirement,
  applyUserAnswer,
  attachResearch,
  buildNextAssistantMessage,
  buildResearchQuery,
  createInitialMessage,
  createSeedSession,
  createUserMessage,
  finalizeSession,
  shouldTriggerResearch,
  type Message,
  type RequirementSession,
  type ResearchItem,
  type ResearchState,
} from "@/lib/requirement-engine";
import { clearSession, loadSession, saveSession } from "@/lib/session-storage";
import { copyText, formatScoreLabel } from "@/lib/utils";

const EXAMPLES = [
  "我想做一个帮小红书博主去 AI 腔并检查平台合规的工具",
  "我想做一个帮应届生根据 JD 改简历并模拟面试的产品",
  "我想做一个帮家长拍照诊断错题并生成练习题的 H5",
];

function addAssistantMessage(session: RequirementSession, content: string): RequirementSession {
  const message: Message = {
    id: `m_${Date.now()}_assistant_${Math.random().toString(16).slice(2)}`,
    role: "assistant",
    content,
    createdAt: new Date().toISOString(),
  };
  return { ...session, messages: [...session.messages, message], updatedAt: new Date().toISOString() };
}

function buildSessionWithAnalysis(session: RequirementSession): RequirementSession {
  const bundle = analyzeRequirement(session);
  return {
    ...session,
    score: bundle.score,
    evaluation: bundle.evaluation,
    prd: bundle.prd,
    validationPlan: bundle.validationPlan,
    status: bundle.nextQuestions.length === 0 ? "ready" : "collecting",
    messages: session.messages.length ? session.messages : [createInitialMessage(session.idea)],
  };
}

function makeSearchSignal(input: string) {
  return input.trim().replace(/\s+/g, " ").slice(0, 120);
}

async function researchServer(query: string): Promise<ResearchState> {
  const response = await fetch(`/api/research?q=${encodeURIComponent(query)}`, {
    method: "GET",
    headers: { Accept: "application/json" },
  });

  if (!response.ok) {
    throw new Error(`research failed: ${response.status}`);
  }

  return (await response.json()) as ResearchState;
}

export default function WorkspacePage() {
  const [session, setSession] = useState<RequirementSession>(() => buildSessionWithAnalysis(createSeedSession()));
  const [input, setInput] = useState("");
  const [copied, setCopied] = useState(false);
  const [researchLoading, setResearchLoading] = useState(false);

  useEffect(() => {
    const loaded = loadSession();
    if (loaded) setSession(buildSessionWithAnalysis(loaded));
  }, []);

  useEffect(() => {
    saveSession(session);
  }, [session]);

  const bundle = useMemo(() => analyzeRequirement(session), [session]);
  const completeness = Math.round(((QUESTION_ORDER.length - bundle.evaluation.missingInfo.length) / QUESTION_ORDER.length) * 100);
  const scoreLabel = formatScoreLabel(bundle.score.total);

  const triggerResearch = async (force = false) => {
    const query = makeSearchSignal(buildResearchQuery(session));
    if (!query) return;
    if (!force && session.research.status !== "idle") return;

    setResearchLoading(true);
    setSession((current) => ({
      ...current,
      research: {
        ...current.research,
        status: "searching",
        query,
        updatedAt: new Date().toISOString(),
      },
    }));

    try {
      const research = await researchServer(query);
      setSession((current) => {
        const nextSession = attachResearch(current, research);
        const finalized = finalizeSession(nextSession);
        const assistant = buildNextAssistantMessage(analyzeRequirement(finalized));
        return addAssistantMessage(
          {
            ...finalized,
            research: { ...research, query, updatedAt: new Date().toISOString() },
            status: assistant.kind === "ready" ? "ready" : "collecting",
          },
          assistant.content,
        );
      });
    } catch (error) {
      setSession((current) => ({
        ...current,
        research: {
          status: "error",
          query,
          items: [],
          summary: "联网搜索失败，先继续补充需求信息或稍后重试。",
          error: error instanceof Error ? error.message : "unknown error",
          updatedAt: new Date().toISOString(),
        },
      }));
    } finally {
      setResearchLoading(false);
    }
  };

  useEffect(() => {
    if (shouldTriggerResearch(session) && session.research.status === "idle") {
      void triggerResearch();
    }
  }, [session.idea, session.fields.targetUser, session.fields.contextPain, session.research.status]);

  function startWithIdea(idea: string) {
    const base = createSeedSession(idea);
    const analyzed = buildSessionWithAnalysis(base);
    const assistant = buildNextAssistantMessage(analyzeRequirement(analyzed));
    setSession(addAssistantMessage(analyzed, assistant.content));
    setInput("");
  }

  function submitAnswer() {
    const value = input.trim();
    if (!value) return;

    const userMessage = createUserMessage(value);
    const answered = applyUserAnswer(
      { ...session, messages: [...session.messages, userMessage], updatedAt: new Date().toISOString() },
      value,
    );
    const finalized = finalizeSession(answered);
    const nextBundle = analyzeRequirement(finalized);
    const nextAssistant = buildNextAssistantMessage(nextBundle);
    const withAssistant = addAssistantMessage({ ...finalized, status: nextAssistant.kind === "ready" ? "ready" : "collecting" }, nextAssistant.content);
    setSession(withAssistant);
    setInput("");
  }

  function reset() {
    clearSession();
    setInput("");
    setCopied(false);
    setSession(buildSessionWithAnalysis(createSeedSession()));
  }

  async function copyPrd() {
    const ok = await copyText(`${bundle.prd}\n\n${bundle.validationPlan}`);
    setCopied(ok);
    window.setTimeout(() => setCopied(false), 1200);
  }

  function markDone() {
    const done = finalizeSession({ ...session, status: "done" });
    saveSession(done);
    setSession(done);
  }

  return (
    <main className="min-h-screen bg-[#f6f4ee] text-stone-950">
      <header className="sticky top-0 z-20 border-b border-stone-200 bg-white/92 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 lg:px-6">
          <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-stone-700 hover:text-stone-950">
            <ArrowLeft size={17} />
            返回首页
          </Link>
          <div className="flex items-center gap-2">
            <button
              onClick={() => void triggerResearch(true)}
              className="inline-flex h-10 items-center gap-2 rounded-lg border border-teal-300 bg-teal-50 px-3 text-sm font-semibold text-teal-900 hover:bg-teal-100"
            >
              <Search size={16} />
              {researchLoading ? "联网搜索中" : "联网搜索"}
            </button>
            <button
              onClick={reset}
              className="inline-flex h-10 items-center gap-2 rounded-lg border border-stone-300 bg-white px-3 text-sm font-semibold text-stone-800 hover:bg-stone-100"
            >
              <RefreshCcw size={16} />
              重开
            </button>
            <Link
              href="/result"
              onClick={markDone}
              className="inline-flex h-10 items-center gap-2 rounded-lg bg-stone-950 px-3 text-sm font-semibold text-white hover:bg-stone-800"
            >
              看结果
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </header>

      <section className="mx-auto grid max-w-7xl gap-4 px-4 py-4 lg:grid-cols-[280px_minmax(0,1fr)_380px] lg:px-6">
        <aside className="rounded-[8px] border border-stone-200 bg-white p-4 shadow-sm lg:sticky lg:top-20 lg:h-[calc(100vh-6rem)] lg:overflow-auto">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-stone-950">需求完整度</p>
              <p className="mt-1 text-xs text-stone-500">每补一项都会刷新判断</p>
            </div>
            <div className="rounded-lg bg-teal-50 px-2.5 py-1 text-sm font-bold text-teal-800">{completeness}%</div>
          </div>
          <div className="mt-4 h-2 overflow-hidden rounded-full bg-stone-100">
            <div className="h-full rounded-full bg-teal-700" style={{ width: `${completeness}%` }} />
          </div>

          <div className="mt-5 space-y-2">
            {QUESTION_ORDER.map((question) => {
              const value = session.fields[question.key];
              const done = value.trim().length > 0;
              return (
                <div key={question.key} className="rounded-[8px] border border-stone-200 bg-stone-50 p-3">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-stone-850">{question.title}</p>
                    <span className={`rounded-md px-2 py-0.5 text-xs font-semibold ${done ? "bg-teal-100 text-teal-800" : "bg-amber-100 text-amber-800"}`}>
                      {done ? "已补" : "待补"}
                    </span>
                  </div>
                  <p className="mt-1 line-clamp-2 text-xs leading-5 text-stone-500">{done ? value : question.hint}</p>
                </div>
              );
            })}
          </div>
        </aside>

        <section className="rounded-[8px] border border-stone-200 bg-white shadow-sm">
          <div className="border-b border-stone-200 p-4">
            <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
              <div>
                <h1 className="text-xl font-semibold text-stone-950">需求访谈工作台</h1>
                <p className="mt-1 text-sm text-stone-600">按事实追问，不直接跳到方案。</p>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm sm:grid-cols-4">
                <Stat label="真需求" value={`${bundle.score.total}`} />
                <Stat label="状态" value={scoreLabel} />
                <Stat label="缺口" value={`${bundle.evaluation.missingInfo.length}`} />
                <Stat label="红旗" value={`${bundle.evaluation.redFlags.length}`} />
              </div>
            </div>

            {!session.fields.idea && (
              <div className="mt-4 grid gap-2">
                <p className="text-sm font-semibold text-stone-700">快速开始</p>
                {EXAMPLES.map((example) => (
                  <button
                    key={example}
                    onClick={() => startWithIdea(example)}
                    className="rounded-lg border border-stone-200 bg-stone-50 px-3 py-2 text-left text-sm text-stone-700 hover:border-teal-300 hover:bg-teal-50"
                  >
                    {example}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="max-h-[52vh] min-h-[380px] space-y-3 overflow-auto p-4 lg:max-h-[calc(100vh-22rem)]">
            {session.messages.map((message) => (
              <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[88%] whitespace-pre-wrap rounded-[8px] px-4 py-3 text-sm leading-7 ${
                    message.role === "user" ? "bg-stone-950 text-white" : "border border-stone-200 bg-stone-50 text-stone-750"
                  }`}
                >
                  {message.content}
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-stone-200 p-4">
            <div className="flex items-start gap-2">
              <textarea
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={(event) => {
                  if ((event.metaKey || event.ctrlKey) && event.key === "Enter") submitAnswer();
                }}
                placeholder={session.fields.idea ? "回答上面的关键问题，支持一次写多个信息点。" : "先输入一句话产品想法。"}
                className="min-h-24 flex-1 resize-none rounded-[8px] border border-stone-300 bg-white px-3 py-3 text-sm leading-6 outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
              />
              <button
                onClick={submitAnswer}
                className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-teal-700 text-white hover:bg-teal-800"
                aria-label="发送"
              >
                <Send size={18} />
              </button>
            </div>
            <p className="mt-2 text-xs text-stone-500">快捷键：`⌘/Ctrl + Enter` 发送。</p>
          </div>
        </section>

        <aside className="space-y-4 lg:sticky lg:top-20 lg:h-[calc(100vh-6rem)] lg:overflow-auto">
          <Panel title="真需求判断" icon={Gauge}>
            <div className="flex items-end justify-between gap-3">
              <div>
                <p className="text-4xl font-semibold text-stone-950">{bundle.score.total}</p>
                <p className="text-sm text-stone-500">满分 100</p>
              </div>
              <span className="rounded-lg bg-stone-950 px-3 py-1.5 text-sm font-semibold text-white">{bundle.evaluation.verdict}</span>
            </div>
            <div className="mt-4 grid gap-2">
              {[
                ["真实场景", bundle.score.realScenario, 20],
                ["高频痛点", bundle.score.frequency, 20],
                ["替代成本", bundle.score.alternativeCost, 15],
                ["付费意愿", bundle.score.willingnessToPay, 15],
                ["MVP", bundle.score.mvpFeasibility, 15],
              ].map(([label, value, max]) => (
                <Meter key={String(label)} label={String(label)} value={Number(value)} max={Number(max)} />
              ))}
            </div>
          </Panel>

          <Panel title="联网研究" icon={WandSparkles}>
            <p className="text-sm leading-7 text-stone-600">
              系统会根据你的想法和目标用户自动去 Bing 搜索候选竞品、替代服务和网页证据，然后回填到研究卡片里。
            </p>
            <div className="mt-3 rounded-lg border border-stone-200 bg-stone-50 p-3 text-sm leading-6 text-stone-700">
              <p className="font-semibold text-stone-950">查询词</p>
              <p className="mt-1 break-words">{session.research.query || buildResearchQuery(session)}</p>
              <p className="mt-2 text-xs text-stone-500">状态：{session.research.status}{researchLoading ? " · 搜索中" : ""}</p>
            </div>
            <div className="mt-3 space-y-2">
              {session.research.items.slice(0, 4).map((item) => (
                <ResearchCard key={item.url} item={item} />
              ))}
              {session.research.status === "error" && (
                <div className="rounded-lg bg-rose-50 px-3 py-2 text-sm leading-6 text-rose-900">{session.research.error || "联网搜索失败"}</div>
              )}
              {!session.research.items.length && session.research.status !== "error" && (
                <div className="rounded-lg bg-stone-50 px-3 py-2 text-sm leading-6 text-stone-600">
                  等你输入更明确的想法后，我会自动回填竞品和替代服务。
                </div>
              )}
            </div>
          </Panel>

          <Panel title="风险与缺口" icon={AlertTriangle}>
            <p className="text-sm leading-7 text-stone-600">{bundle.evaluation.summary}</p>
            <div className="mt-3 space-y-2">
              {bundle.evaluation.reasons.slice(0, 3).map((item) => (
                <p key={item} className="rounded-lg bg-amber-50 px-3 py-2 text-sm leading-6 text-amber-900">{item}</p>
              ))}
              {bundle.evaluation.redFlags.slice(0, 2).map((item) => (
                <p key={item} className="rounded-lg bg-rose-50 px-3 py-2 text-sm leading-6 text-rose-900">{item}</p>
              ))}
            </div>
          </Panel>

          <Panel title="PRD 草稿" icon={FileText}>
            <pre className="max-h-80 overflow-auto whitespace-pre-wrap rounded-[8px] bg-stone-50 p-3 text-xs leading-6 text-stone-700">{bundle.prd}</pre>
            <div className="mt-3 flex gap-2">
              <button
                onClick={copyPrd}
                className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-lg border border-stone-300 bg-white text-sm font-semibold text-stone-800 hover:bg-stone-100"
              >
                <Copy size={16} />
                {copied ? "已复制" : "复制草稿"}
              </button>
              <Link href="/result" onClick={markDone} className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-lg bg-teal-700 text-sm font-semibold text-white hover:bg-teal-800">
                <ClipboardCheck size={16} />
                定稿
              </Link>
            </div>
          </Panel>
        </aside>
      </section>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[8px] border border-stone-200 bg-stone-50 px-3 py-2">
      <p className="text-xs text-stone-500">{label}</p>
      <p className="mt-0.5 text-sm font-semibold text-stone-950">{value}</p>
    </div>
  );
}

function Panel({ title, icon: Icon, children }: { title: string; icon: typeof MessageSquareText; children: React.ReactNode }) {
  return (
    <div className="rounded-[8px] border border-stone-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center gap-2">
        <Icon size={18} className="text-teal-700" />
        <h2 className="text-base font-semibold text-stone-950">{title}</h2>
      </div>
      {children}
    </div>
  );
}

function Meter({ label, value, max }: { label: string; value: number; max: number }) {
  const width = Math.round((value / max) * 100);
  return (
    <div>
      <div className="flex items-center justify-between text-xs text-stone-500">
        <span>{label}</span>
        <span>{value}/{max}</span>
      </div>
      <div className="mt-1 h-2 overflow-hidden rounded-full bg-stone-100">
        <div className="h-full rounded-full bg-teal-700" style={{ width: `${width}%` }} />
      </div>
    </div>
  );
}

function ResearchCard({ item }: { item: ResearchItem }) {
  return (
    <a href={item.url} target="_blank" rel="noreferrer" className="block rounded-[8px] border border-stone-200 bg-white p-3 transition hover:border-teal-300 hover:bg-teal-50">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-semibold text-stone-950">{item.title}</p>
        <span className="rounded-md bg-stone-100 px-2 py-0.5 text-[11px] font-semibold text-stone-600">{item.source}</span>
      </div>
      <p className="mt-1 text-xs leading-5 text-stone-600 line-clamp-3">{item.snippet}</p>
      <p className="mt-2 text-[11px] text-teal-700">{item.kind === "competitor" ? "竞品" : item.kind === "alternative" ? "替代服务" : "证据"}</p>
    </a>
  );
}
