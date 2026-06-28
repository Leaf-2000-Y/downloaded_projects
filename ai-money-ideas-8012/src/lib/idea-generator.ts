export type IdeaInput = {
  industry: string;
  skills: string;
  audience: string;
  time: string;
  revenueGoal: string;
};

export type ProductIdea = {
  name: string;
  targetUser: string;
  problem: string;
  mvpFeatures: string[];
  threeHourVersion: string;
  monetization: string[];
};

const fallbackInput: IdeaInput = {
  industry: "你的行业",
  skills: "内容整理、流程设计、AI工具使用",
  audience: "有明确需求但缺少时间的人",
  time: "每周 5-10 小时",
  revenueGoal: "先验证付费意愿",
};

function clean(value: string, fallback: string) {
  return value.trim() || fallback;
}

export function normalizeInput(input: IdeaInput): IdeaInput {
  return {
    industry: clean(input.industry, fallbackInput.industry),
    skills: clean(input.skills, fallbackInput.skills),
    audience: clean(input.audience, fallbackInput.audience),
    time: clean(input.time, fallbackInput.time),
    revenueGoal: clean(input.revenueGoal, fallbackInput.revenueGoal),
  };
}

export function generateIdeas(rawInput: IdeaInput): ProductIdea[] {
  const input = normalizeInput(rawInput);
  const audience = input.audience;
  const industry = input.industry;
  const skills = input.skills;

  return [
    {
      name: `${industry} AI 快速诊断官`,
      targetUser: audience,
      problem: `${audience}常常知道自己遇到瓶颈，却很难快速判断问题优先级，也缺少可执行的下一步。`,
      mvpFeatures: [
        "结构化问题采集表单",
        "AI 生成痛点诊断和优先级排序",
        "输出 7 天行动清单",
      ],
      threeHourVersion:
        "用一个表单收集背景、目标和障碍，再用固定提示词生成诊断报告，最后通过 Notion、飞书文档或网页展示结果。",
      monetization: [
        "单次诊断报告付费",
        "行业模板包售卖",
        "升级为 1 对 1 咨询或陪跑服务",
      ],
    },
    {
      name: `${skills.split(/[，,、\s]+/)[0] || "专业技能"} AI 模板工坊`,
      targetUser: `${industry}领域里想节省重复劳动的个人或小团队`,
      problem: `很多${industry}工作流重复但不标准，用户每次都要从空白开始，效率和质量都不稳定。`,
      mvpFeatures: [
        "选择使用场景和输出类型",
        "自动生成可复制的提示词、表格或文案模板",
        "收藏 3 个常用模板",
      ],
      threeHourVersion:
        "先做一个单页模板生成器，内置 5 个高频场景，用户输入少量信息即可得到一份可复制的成品。",
      monetization: [
        "高级模板订阅",
        "按行业出售模板合集",
        "为企业定制内部工作流模板",
      ],
    },
    {
      name: `${audience} 变现路线图助手`,
      targetUser: `拥有${skills}能力、希望用${input.time}验证收入机会的人`,
      problem: `想做 AI 产品的人容易卡在选题、MVP 范围和收费方式上，迟迟无法开始验证${input.revenueGoal}。`,
      mvpFeatures: [
        "输入资源、技能和变现目标",
        "生成 3 条产品路线",
        "拆解首周任务和最小收费实验",
      ],
      threeHourVersion:
        "做成一个前端问卷，提交后生成三张路线卡片，每张卡片包含目标用户、MVP、3 小时版本和收费实验。",
      monetization: [
        "路线图生成次数包",
        "付费下载执行清单",
        "社群、训练营或项目陪跑",
      ],
    },
  ];
}
