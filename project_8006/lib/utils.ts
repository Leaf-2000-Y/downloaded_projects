export function formatScoreLabel(total: number) {
  if (total >= 80) return "优先做";
  if (total >= 60) return "可验证";
  if (total >= 40) return "继续访谈";
  return "高风险";
}

export function cnDate(value: string | Date) {
  const date = typeof value === "string" ? new Date(value) : value;
  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function copyText(text: string) {
  if (typeof navigator === "undefined") return Promise.resolve(false);
  return navigator.clipboard.writeText(text).then(() => true).catch(() => false);
}

export function mergeLines(lines: Array<string | undefined | null>) {
  return lines.filter(Boolean).join("\n");
}
