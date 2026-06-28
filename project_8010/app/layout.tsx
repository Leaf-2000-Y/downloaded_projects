import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "个人复盘助手",
  description: "一个本地优先的目标纠偏型 AI 复盘助手"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
