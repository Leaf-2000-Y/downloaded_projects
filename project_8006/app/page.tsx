"use client";

import Link from "next/link";
import { ArrowRight, Brain, ClipboardList, ShieldAlert, Timer, Workflow } from "lucide-react";
import { useMemo } from "react";
import { analyzeRequirement, createSeedSession } from "@/lib/requirement-engine";
import { formatScoreLabel } from "@/lib/utils";

const demoSession = analyzeRequirement(
  (() => {
    const session = createSeedSession("帮小红书博主去 AI 腔并生成可发的选题文案");
    session.fields = {
      ...session.fields,
      idea: "帮小红书博主去 AI 腔并生成可发的选题文案",
      targetUser: "25-30 岁小红书副业博主，主业月薪 8k",
      scenario: "每次发笔记前在晚上 9 点到 11 点改稿",
      painPoint: "AI 写得太模板化，发出去容易限流",
      currentAlternative: "自己改、找朋友看、硬用通用模型反复重写",
      competitors: "通用大模型、小红书模板、人工改稿服务",
      frequency: "几乎每天发内容前都会遇到",
      willingnessToPay: "愿意月付 19-29 元，也接受按次 9.9 元",
      mvpScope: "只做去 AI 腔和合规提醒，不做选题、不做排版",
      risks: "需要避免平台规则踩雷，内容要注意隐私和审核",
      validationEvidence: "先找 5 个博主做原型测试，再收集意向金",
    };
    return session;
  })(),
);

const highlights = [
  {
    icon: Brain,
    title: "多轮追问",
    text: "系统只问最关键的 1-3 个问题，把用户从一句话想法带到可开发的需求。",
  },
  {
    icon: ClipboardList,
    title: "自动 PRD",
    text: "把已确认的信息整理成标准 PRD，包含目标用户、MVP、验收标准和风险。",
  },
  {
    icon: ShieldAlert,
    title: "真需求判断",
    text: "基于替代方案、付费证据、频率和 MVP 可行性，给出继续访谈或直接推进的判断。",
  },
  {
    icon: Timer,
    title: "72 小时验证",
    text: "输出可执行的访谈、原型和付费验证计划，避免一上来就重开发。",
  },
];

export default function HomePage() {
  const scoreTag = useMemo(() => formatScoreLabel(demoSession.score.total), []);

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(15,118,110,0.08),_transparent_32%),linear-gradient(180deg,#f6f4ee_0%,#fbfaf6_100%)] text-[var(--foreground)]">
      <section className="mx-auto grid min-h-screen max-w-7xl grid-cols-1 gap-10 px-5 py-6 lg:grid-cols-[1.02fr_0.98fr] lg:px-8">
        <div className="flex flex-col justify-center py-6">
          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-teal-200 bg-teal-50 px-3 py-1 text-sm font-medium text-teal-800">
            <Workflow size={16} />
            AI 需求梳理与产品验证工作台
          </div>
          <h1 className="mt-6 max-w-2xl text-4xl font-semibold leading-tight tracking-normal text-stone-950 sm:text-5xl lg:text-6xl">
            把一句模糊想法，梳理成能开发、能验证、能交付的 PRD
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-stone-600">
            先追问用户是谁、问题在哪、现在怎么凑合解决，再判断真伪需求，最后自动生成 PRD 和 72 小时验证计划。
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/workspace"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-stone-950 px-5 text-base font-semibold text-white transition hover:bg-stone-800"
            >
              进入工作台
              <ArrowRight size={18} />
            </Link>
            <a
              href="#highlights"
              className="inline-flex h-12 items-center justify-center rounded-lg border border-stone-300 bg-white px-5 text-base font-semibold text-stone-900 transition hover:bg-stone-100"
            >
              看看它怎么工作
            </a>
          </div>

          <div className="mt-8 grid max-w-2xl gap-3 sm:grid-cols-2">
            {[
              `当前示例评分：${demoSession.score.total}/100`,
              `当前判断：${demoSession.evaluation.verdict}`,
              `风险标签：${scoreTag}`,
              `参考站点：AI 赚钱产品灵感生成器`,
            ].map((item) => (
              <div key={item} className="rounded-[8px] border border-stone-200 bg-white px-4 py-3 text-sm text-stone-700 shadow-sm">
                {item}
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center">
          <div className="w-full rounded-[8px] border border-stone-200 bg-white p-5 shadow-sm lg:p-6">
            <div className="grid gap-3 sm:grid-cols-2">
              {highlights.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.title} className="rounded-[8px] border border-stone-200 bg-stone-50 p-4">
                    <div className="flex items-center gap-2 text-stone-950">
                      <Icon size={18} className="text-teal-700" />
                      <h2 className="text-base font-semibold">{item.title}</h2>
                    </div>
                    <p className="mt-2 text-sm leading-7 text-stone-600">{item.text}</p>
                  </div>
                );
              })}
            </div>

            <div id="highlights" className="mt-5 rounded-[8px] border border-dashed border-teal-200 bg-teal-50/70 p-4">
              <p className="text-sm font-semibold text-teal-900">工作方式</p>
              <p className="mt-2 text-sm leading-7 text-teal-950">
                用户先输入一个想法，系统根据缺口逐轮提问；每补齐一层信息，就刷新完整度评分、真需求风险、PRD 草稿和验证计划。
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
