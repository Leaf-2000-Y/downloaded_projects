import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Sparkles, Timer, WalletCards } from "lucide-react";

const benefits = [
  {
    icon: Sparkles,
    title: "把模糊想法变成产品方向",
    description: "围绕行业、技能和目标用户，快速收敛出更适合你的 AI 产品切入点。",
  },
  {
    icon: Timer,
    title: "强调 3 小时可验证",
    description: "每个建议都包含极简版本，避免一开始就陷入大而全的开发计划。",
  },
  {
    icon: WalletCards,
    title: "从第一天考虑变现",
    description: "不只给创意，也给后续收费、模板化和服务升级的路径。",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-[#f7f7f2] text-stone-950">
      <section className="relative overflow-hidden border-b border-stone-200 bg-white">
        <div className="mx-auto grid min-h-[92vh] w-full max-w-7xl grid-cols-1 items-center gap-10 px-5 py-8 sm:px-8 lg:grid-cols-[0.92fr_1.08fr] lg:px-10">
          <div className="z-10 max-w-2xl py-10">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-teal-200 bg-teal-50 px-3 py-1 text-sm font-medium text-teal-800">
              <Sparkles size={16} />
              AI赚钱产品灵感生成器
            </div>
            <h1 className="text-4xl font-semibold leading-tight tracking-normal text-stone-950 sm:text-5xl lg:text-6xl">
              用 2 分钟找到适合你的 AI 赚钱产品方向
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-stone-650">
              输入你的行业、技能、目标用户、可投入时间和变现目标，系统会模拟生成 3 个可落地的 AI 产品建议，帮你从“想做点什么”走到“今天就能验证什么”。
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/form"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-stone-950 px-5 text-base font-semibold text-white shadow-sm transition hover:bg-stone-800"
              >
                开始生成
                <ArrowRight size={18} />
              </Link>
              <a
                href="#value"
                className="inline-flex h-12 items-center justify-center rounded-lg border border-stone-300 px-5 text-base font-semibold text-stone-900 transition hover:bg-stone-100"
              >
                查看工具价值
              </a>
            </div>
          </div>
          <div className="relative min-h-[340px] overflow-hidden rounded-[8px] border border-stone-200 bg-stone-100 shadow-sm lg:min-h-[560px]">
            <Image
              src="/images/ai-product-workspace.png"
              alt="AI 产品灵感工作台插画"
              fill
              priority
              sizes="(min-width: 1024px) 52vw, 100vw"
              className="object-cover"
            />
          </div>
        </div>
      </section>

      <section id="value" className="mx-auto max-w-7xl px-5 py-14 sm:px-8 lg:px-10">
        <div className="grid gap-4 md:grid-cols-3">
          {benefits.map((benefit) => (
            <article
              key={benefit.title}
              className="rounded-[8px] border border-stone-200 bg-white p-5 shadow-sm"
            >
              <benefit.icon className="mb-4 text-amber-600" size={24} />
              <h2 className="text-xl font-semibold text-stone-950">{benefit.title}</h2>
              <p className="mt-3 leading-7 text-stone-600">{benefit.description}</p>
            </article>
          ))}
        </div>

        <div className="mt-12 grid gap-8 rounded-[8px] border border-stone-200 bg-white p-5 shadow-sm md:grid-cols-[0.85fr_1.15fr] md:p-8">
          <div>
            <p className="text-sm font-semibold uppercase tracking-normal text-teal-700">
              适合谁使用
            </p>
            <h2 className="mt-3 text-3xl font-semibold text-stone-950">
              创业者、自由职业者、职场人和 AI 爱好者都能用
            </h2>
          </div>
          <ul className="grid gap-3 text-stone-700 sm:grid-cols-2">
            {["想做 AI 产品但还没有明确方向", "想用自己的行业经验做副业", "希望先验证付费意愿再投入开发", "需要把技能包装成可售卖产品"].map((item) => (
              <li key={item} className="flex gap-3">
                <CheckCircle2 className="mt-1 shrink-0 text-teal-700" size={18} />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </main>
  );
}
