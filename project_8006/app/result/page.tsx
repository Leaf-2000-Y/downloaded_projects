"use client";

import Link from "next/link";
import { ArrowLeft, ClipboardCopy, Download, FileText, ShieldCheck, Sparkles } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { createSeedSession } from "@/lib/requirement-engine";
import { loadSession } from "@/lib/session-storage";
import { copyText } from "@/lib/utils";

export default function ResultPage() {
  const [copied, setCopied] = useState(false);
  const session = useMemo(() => loadSession() ?? createSeedSession(""), []);

  useEffect(() => {
    document.title = "结果页 - AI 需求梳理与产品验证工作台";
  }, []);

  async function copyAll() {
    const text = `${session.prd}\n\n${session.validationPlan}`;
    const ok = await copyText(text);
    setCopied(ok);
    window.setTimeout(() => setCopied(false), 1600);
  }

  return (
    <main className="min-h-screen bg-[#f6f4ee] text-stone-950">
      <header className="border-b border-stone-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 lg:px-6">
          <Link href="/workspace" className="inline-flex items-center gap-2 text-sm font-semibold text-stone-700 hover:text-stone-950">
            <ArrowLeft size={17} />
            返回工作台
          </Link>
          <div className="flex gap-2">
            <button
              onClick={copyAll}
              className="inline-flex h-10 items-center gap-2 rounded-lg border border-stone-300 bg-white px-3 text-sm font-semibold text-stone-800 hover:bg-stone-100"
            >
              <ClipboardCopy size={16} />
              {copied ? "已复制" : "复制全部"}
            </button>
            <button className="inline-flex h-10 items-center gap-2 rounded-lg bg-stone-950 px-3 text-sm font-semibold text-white hover:bg-stone-800">
              <Download size={16} />
              导出占位
            </button>
          </div>
        </div>
      </header>

      <section className="mx-auto grid max-w-7xl gap-4 px-4 py-5 lg:grid-cols-[240px_minmax(0,1fr)] lg:px-6">
        <aside className="rounded-[8px] border border-stone-200 bg-white p-4 shadow-sm lg:sticky lg:top-20 lg:h-[calc(100vh-6rem)]">
          <div className="rounded-[8px] border border-teal-200 bg-teal-50 p-4">
            <div className="flex items-center gap-2 text-teal-900">
              <ShieldCheck size={18} />
              <p className="font-semibold">最终判断</p>
            </div>
            <p className="mt-3 text-3xl font-semibold text-stone-950">{session.score.total}</p>
            <p className="mt-1 text-sm text-stone-600">{session.evaluation.verdict}</p>
          </div>

          <div className="mt-4 space-y-2 text-sm">
            <Meta label="场景与痛点" value={session.fields.contextPain || "待补充"} />
            <Meta label="用户" value={session.fields.targetUser || "待补充"} />
            <Meta label="替代方案" value={session.fields.currentAlternative || "待补充"} />
            <Meta label="联网研究" value={session.research.summary || "待补充"} />
          </div>
        </aside>

        <div className="space-y-4">
          <article className="rounded-[8px] border border-stone-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2 text-teal-700">
              <Sparkles size={18} />
              <h1 className="text-xl font-semibold text-stone-950">PRD 草稿</h1>
            </div>
            <div className="prose-lite mt-4 max-w-none whitespace-pre-wrap">{session.prd || "暂无 PRD 草稿，请回到工作台继续补充信息。"}</div>
          </article>

          <article className="rounded-[8px] border border-stone-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2 text-teal-700">
              <FileText size={18} />
              <h2 className="text-xl font-semibold text-stone-950">72 小时验证计划</h2>
            </div>
            <div className="prose-lite mt-4 max-w-none whitespace-pre-wrap">{session.validationPlan || "暂无验证计划。"}</div>
          </article>

          <article className="rounded-[8px] border border-stone-200 bg-white p-5 shadow-sm">
            <h2 className="text-xl font-semibold text-stone-950">判断摘要</h2>
            <div className="mt-3 grid gap-2 md:grid-cols-2">
              <Summary title="红旗" items={session.evaluation.redFlags} />
              <Summary title="缺失信息" items={session.evaluation.missingInfo} />
              <Summary title="判断理由" items={session.evaluation.reasons} />
            </div>
          </article>
        </div>
      </section>
    </main>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[8px] border border-stone-200 bg-stone-50 p-3">
      <p className="text-xs text-stone-500">{label}</p>
      <p className="mt-1 text-sm leading-6 text-stone-800">{value}</p>
    </div>
  );
}

function Summary({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-[8px] border border-stone-200 bg-stone-50 p-4">
      <p className="text-sm font-semibold text-stone-950">{title}</p>
      <ul className="mt-2 list-disc space-y-2 pl-4 text-sm leading-6 text-stone-600">
        {items.length ? items.map((item) => <li key={item}>{item}</li>) : <li>暂无</li>}
      </ul>
    </div>
  );
}
