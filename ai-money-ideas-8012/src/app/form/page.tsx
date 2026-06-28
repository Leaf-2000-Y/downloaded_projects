"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Clock, Target, UserRound, WalletCards, Wrench } from "lucide-react";
import type { IdeaInput } from "@/lib/idea-generator";

const fields: Array<{
  id: keyof IdeaInput;
  label: string;
  helper: string;
  placeholder: string;
  icon: typeof Wrench;
  multiline?: boolean;
}> = [
  {
    id: "industry",
    label: "你的行业",
    helper: "例如：教育、法律、跨境电商、健身、本地生活",
    placeholder: "在线教育 / 知识付费",
    icon: Target,
  },
  {
    id: "skills",
    label: "你擅长的技能",
    helper: "写出你能稳定交付的能力",
    placeholder: "课程设计、内容写作、社群运营、AI提示词",
    icon: Wrench,
    multiline: true,
  },
  {
    id: "audience",
    label: "你想服务的目标用户",
    helper: "越具体越容易生成可执行方案",
    placeholder: "想做副业但没有产品思路的职场人",
    icon: UserRound,
    multiline: true,
  },
  {
    id: "time",
    label: "每周可投入时间",
    helper: "用于判断 MVP 范围",
    placeholder: "每周 5-10 小时",
    icon: Clock,
  },
  {
    id: "revenueGoal",
    label: "你的变现目标",
    helper: "例如先赚第一单、月入 3000、验证订阅收入",
    placeholder: "先在一个月内验证 3 个付费用户",
    icon: WalletCards,
    multiline: true,
  },
];

const initialValue: IdeaInput = {
  industry: "",
  skills: "",
  audience: "",
  time: "",
  revenueGoal: "",
};

export default function FormPage() {
  const router = useRouter();

  function handleSubmit(formData: FormData) {
    const input = fields.reduce((acc, field) => {
      acc[field.id] = String(formData.get(field.id) ?? "");
      return acc;
    }, { ...initialValue });

    const params = new URLSearchParams(input);
    router.push(`/results?${params.toString()}`);
  }

  return (
    <main className="min-h-screen bg-[#f7f7f2] px-5 py-6 text-stone-950 sm:px-8 lg:px-10">
      <div className="mx-auto max-w-4xl">
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-lg px-1 py-2 text-sm font-semibold text-stone-600 transition hover:text-stone-950"
        >
          <ArrowLeft size={16} />
          返回首页
        </Link>

        <header className="mt-8 max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-normal text-teal-700">
            Step 1 / 输入你的情况
          </p>
          <h1 className="mt-3 text-3xl font-semibold leading-tight sm:text-5xl">
            先描述你的资源，系统再帮你缩小产品方向
          </h1>
          <p className="mt-4 text-lg leading-8 text-stone-600">
            不需要写得完美。你可以先填一个粗略版本，生成结果后再回来微调。
          </p>
        </header>

        <form action={handleSubmit} className="mt-8 grid gap-4">
          {fields.map((field) => (
            <label
              key={field.id}
              className="grid gap-3 rounded-[8px] border border-stone-200 bg-white p-4 shadow-sm sm:grid-cols-[220px_1fr] sm:p-5"
            >
              <span className="flex gap-3">
                <field.icon className="mt-1 shrink-0 text-amber-600" size={20} />
                <span>
                  <span className="block font-semibold text-stone-950">{field.label}</span>
                  <span className="mt-1 block text-sm leading-6 text-stone-500">{field.helper}</span>
                </span>
              </span>
              {field.multiline ? (
                <textarea
                  name={field.id}
                  placeholder={field.placeholder}
                  rows={3}
                  className="min-h-28 w-full resize-y rounded-[8px] border border-stone-300 bg-stone-50 px-4 py-3 text-base leading-7 outline-none transition placeholder:text-stone-400 focus:border-teal-600 focus:bg-white focus:ring-4 focus:ring-teal-100"
                />
              ) : (
                <input
                  name={field.id}
                  placeholder={field.placeholder}
                  className="h-12 w-full rounded-[8px] border border-stone-300 bg-stone-50 px-4 text-base outline-none transition placeholder:text-stone-400 focus:border-teal-600 focus:bg-white focus:ring-4 focus:ring-teal-100"
                />
              )}
            </label>
          ))}

          <div className="sticky bottom-0 -mx-5 mt-4 border-t border-stone-200 bg-[#f7f7f2]/95 px-5 py-4 backdrop-blur sm:static sm:mx-0 sm:border-0 sm:bg-transparent sm:px-0">
            <button
              type="submit"
              className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-stone-950 px-5 text-base font-semibold text-white shadow-sm transition hover:bg-stone-800 sm:w-auto"
            >
              生成 3 个产品建议
              <ArrowRight size={18} />
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
