import { expect, test } from "@playwright/test";

test("completes the local-first review assistant MVP flow", async ({ page }) => {
  await page.goto("/");

  await expect(page).toHaveTitle("个人复盘助手");

  await page
    .getByLabel("人生方向 / 年度目标")
    .fill("做出可持续的个人 AI 产品");
  await page
    .getByLabel("未来 1-3 个月阶段目标")
    .fill("上线个人复盘助手 MVP");
  await page
    .getByLabel("每天重点行动方向")
    .fill("每天推进最小可发布版本");
  await page.getByRole("button", { name: "保存目标并开始复盘" }).click();

  await expect(page.getByRole("heading", { name: "今日复盘" })).toBeVisible();
  await page
    .getByLabel("今天关键事件")
    .fill("完成了产品 SPEC，明确第一版只做复盘纠偏。");
  await page
    .getByLabel("今天的问题 / 错误")
    .fill("上午发散去看太多工具，真正推进产品的时间偏晚。");
  await page.getByLabel("今天推进了最重要目标").check();
  await page
    .getByLabel("如果偏航，被什么带偏了")
    .fill("被工具选择和设计细节带偏。");
  await page
    .getByLabel("明天想推进的方向")
    .fill("完成复盘助手首页第一屏文案，并发布到本地预览。");
  await page.getByRole("button", { name: "生成复盘卡片" }).click();

  await expect(page.getByRole("heading", { name: "复盘卡片" })).toBeVisible();
  await expect(page.getByText("明天最重要动作")).toBeVisible();
  await expect(page.getByText("防错提醒")).toBeVisible();
  await expect(page.getByText("连续 1 天")).toBeVisible();

  await page.reload();
  await expect(page.getByRole("heading", { name: "昨日行动核对" })).toBeVisible();
  await page
    .getByRole("checkbox", { name: /完成复盘助手首页第一屏文案/ })
    .check();
  await page
    .getByLabel("今天关键事件")
    .fill("把首页第一屏文案写完，并完成本地预览。");
  await page
    .getByLabel("今天的问题 / 错误")
    .fill("开始时又想先调视觉细节，后来拉回到核心表达。");
  await page.getByLabel("今天推进了最重要目标").check();
  await page
    .getByLabel("如果偏航，被什么带偏了")
    .fill("轻微被界面细节带偏。");
  await page
    .getByLabel("明天想推进的方向")
    .fill("完成每日复盘表单的交互细节。");
  await page.getByRole("button", { name: "生成复盘卡片" }).click();

  await expect(page.getByText("昨日 1/1 个行动完成")).toBeVisible();

  await page.getByRole("button", { name: "生成周复盘" }).click();
  await expect(page.getByRole("heading", { name: "本周复盘" })).toBeVisible();
  await expect(page.getByText("本周重复问题")).toBeVisible();

  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "导出 Markdown" }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toContain("personal-review");
});
