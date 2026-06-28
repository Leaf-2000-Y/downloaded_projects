import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI 需求梳理与产品验证工作台",
  description: "从模糊想法到 PRD、真需求判断和 72 小时验证计划。",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
