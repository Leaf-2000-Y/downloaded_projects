import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ClipboardList, Coins, Hammer, RefreshCw, Rocket, UsersRound } from "lucide-react";
import { generateIdeas, normalizeInput, type IdeaInput, type ProductIdea } from "@/lib/idea-generator";

const emptyInput: IdeaInput = {
  industry: "",
  skills: "",
  audience: "",
  time: "",
  revenueGoal: "",
};

function IdeaCard({ idea, index }: { idea: ProductIdea; index: number }) {
  return (
    <article className="rounded-[8px] border border-stone-200 bg-white shadow-sm">
      <div className="border-b border-stone-200 p-5">
        <div className="mb-3 inline-flex h-8 items-center rounded-full bg-amber-100 px-3 text-sm font-semibold text-amber-800">
          方案 {index + 1}
        </div>
        <h2 className="text-2xl font-semibold text-stone-950">{idea.name}</h2>
      </div>

      <div className="grid gap-5 p-5">
        <section>
          <h3 className="flex items-center gap-2 font-semibold text-stone-950">
            <UsersRound size={18} className="text-teal-700" />
            目标用户
          </h3>
          <p className="mt-2 leading-7 text-stone-600">{idea.targetUser}</p>
        </section>
        <section>
          <h3 className="flex items-center gap-2 font-semibold text-stone-950">
            <ClipboardList size={18} className="text-teal-700" />
            要解决的问题
          </h3>
          <p className="mt-2 leading-7 text-stone-600">{idea.problem}</p>
        </section>
        <section>
          <h3 className="flex items-center gap-2 font-semibold text-stone-950">
            <Rocket size={18} className="text-teal-700" />
            MVP 核心功能
          </h3>
          <ul className="mt-3 grid gap-2">
            {idea.mvpFeatures.map((feature) => (
              <li key={feature} className="rounded-[8px] bg-stone-50 px-3 py-2 text-stone-700">
                {feature}
              </li>
            ))}
          </ul>
        </section>
        <section>
          <h3 className="flex items-center gap-2 font-semibold text-stone-950">
            <Hammer size={18} className="text-teal-700" />
            3 小时内可以实现的版本
          </h3>
          <p className="mt-2 leading-7 text-stone-600">{idea.threeHourVersion}</p>
        </section>
        <section>
          <h3 className="flex items-center gap-2 font-semibold text-stone-950">
            <Coins size={18} className="text-teal-700" />
            后续变现方式
          </h3>
          <ul className="mt-3 grid gap-2">
            {idea.monetization.map((item) => (
              <li key={item} className="rounded-[8px] bg-teal-50 px-3 py-2 text-teal-900">
                {item}
              </li>
            ))}
          </ul>
        </section>
      </div>
    </article>
  );
}

export default async function ResultsPage({
  searchParams,
}: {
  searchParams: Promise<Partial<IdeaInput>>;
}) {
  const params = await searchParams;
  const hasInput = Object.values(params).some((value) => String(value ?? "").trim());
  const normalized = normalizeInput(hasInput ? { ...emptyInput, ...params } : emptyInput);
  const ideas = generateIdeas(normalized);

  if (!hasInput) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#f7f7f2] px-5 text-stone-950">
        <section className="w-full max-w-xl rounded-[8px] border border-stone-200 bg-white p-6 text-center shadow-sm">
          <h1 className="text-3xl font-semibold">还没有输入信息</h1>
          <p className="mt-3 leading-7 text-stone-600">
            先填写你的行业、技能和变现目标，才能生成更贴合你的产品建议。
          </p>
          <Link
            href="/form"
            className="mt-6 inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-stone-950 px-5 font-semibold text-white transition hover:bg-stone-800"
          >
            去填写表单
            <RefreshCw size={18} />
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f7f7f2] text-stone-950">
      <section className="border-b border-stone-200 bg-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-5 py-6 sm:px-8 lg:grid-cols-[1fr_360px] lg:px-10">
          <div>
            <Link
              href="/form"
              className="inline-flex items-center gap-2 rounded-lg px-1 py-2 text-sm font-semibold text-stone-600 transition hover:text-stone-950"
            >
              <ArrowLeft size={16} />
              修改输入
            </Link>
            <p className="mt-8 text-sm font-semibold uppercase tracking-normal text-teal-700">
              Step 2 / 生成结果
            </p>
            <h1 className="mt-3 max-w-3xl text-3xl font-semibold leading-tight sm:text-5xl">
              根据你的背景，推荐这 3 个 AI 产品方向
            </h1>
            <div className="mt-5 flex flex-wrap gap-2 text-sm text-stone-700">
              {[normalized.industry, normalized.skills, normalized.audience, normalized.time, normalized.revenueGoal].map((item) => (
                <span key={item} className="rounded-full border border-stone-200 bg-stone-50 px-3 py-1">
                  {item}
                </span>
              ))}
            </div>
          </div>
          <div className="relative hidden min-h-56 overflow-hidden rounded-[8px] border border-stone-200 bg-stone-100 lg:block">
            <Image
              src="/images/ai-product-workspace.png"
              alt="AI 产品灵感工作台插画"
              fill
              sizes="360px"
              className="object-cover"
            />
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-5 px-5 py-8 sm:px-8 lg:grid-cols-3 lg:px-10">
        {ideas.map((idea, index) => (
          <IdeaCard key={idea.name} idea={idea} index={index} />
        ))}
      </section>

      <div className="mx-auto max-w-7xl px-5 pb-12 sm:px-8 lg:px-10">
        <Link
          href="/form"
          className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-lg border border-stone-300 bg-white px-5 font-semibold text-stone-950 transition hover:bg-stone-100 sm:w-auto"
        >
          <RefreshCw size={18} />
          调整信息重新生成
        </Link>
      </div>
    </main>
  );
}
