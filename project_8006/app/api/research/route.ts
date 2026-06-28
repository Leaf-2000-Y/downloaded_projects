import { NextResponse } from "next/server";
import { buildResearchQuery, createSeedSession, type ResearchItem, type ResearchState } from "@/lib/requirement-engine";

export const runtime = "nodejs";

function decodeHtml(value: string) {
  return value.replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;/g, "'").trim();
}

function extractItems(xml: string) {
  const items: Array<{ title: string; link: string; description: string }> = [];
  const blocks = xml.match(/<item>[\s\S]*?<\/item>/g) ?? [];
  for (const block of blocks) {
    const title = decodeHtml((block.match(/<title>(.*?)<\/title>/) ?? ["", ""])[1]);
    const link = decodeHtml((block.match(/<link>(.*?)<\/link>/) ?? ["", ""])[1]);
    const description = decodeHtml((block.match(/<description>(.*?)<\/description>/) ?? ["", ""])[1]);
    if (title && link) items.push({ title, link, description });
  }
  return items;
}

function normalizeSource(url: string) {
  try {
    const host = new URL(url).hostname.replace(/^www\./, "");
    if (host.includes("xiaohongshu")) return "小红书";
    if (host.includes("zhihu")) return "知乎";
    if (host.includes("weibo")) return "微博";
    if (host.includes("bilibili")) return "B 站";
    if (host.includes("douyin")) return "抖音";
    if (host.includes("csdn")) return "CSDN";
    if (host.includes("blog")) return "博客";
    return host;
  } catch {
    return "网页";
  }
}

function classifyItem(title: string, description: string): ResearchItem["kind"] {
  const text = `${title} ${description}`.toLowerCase();
  if (/(代写|代做|人工|教程|模板|批改|咨询|服务|方案)/.test(text)) return "alternative";
  if (/(工具|助手|ai|平台|系统|产品|官网|app|小程序|网站)/.test(text)) return "competitor";
  return "evidence";
}

function queryVariants(query: string) {
  return [query, `${query} site:xiaohongshu.com`, `${query} site:zhihu.com`];
}

async function fetchBingRss(query: string) {
  const url = `https://www.bing.com/search?format=rss&q=${encodeURIComponent(query)}`;
  const response = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0",
      Accept: "application/rss+xml, application/xml;q=0.9, */*;q=0.8",
    },
  });
  if (!response.ok) throw new Error(`bing search failed: ${response.status}`);
  return await response.text();
}

function dedupeByUrl(items: ResearchItem[]) {
  const seen = new Set<string>();
  return items.filter((item) => {
    if (seen.has(item.url)) return false;
    seen.add(item.url);
    return true;
  });
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const rawQuery = url.searchParams.get("q")?.trim() || "";
  const query = rawQuery || buildResearchQuery(createSeedSession(""));

  try {
    const searches = queryVariants(query);
    const xmlList = await Promise.all(searches.map((search) => fetchBingRss(search)));
    const results: ResearchItem[] = xmlList.flatMap((xml) =>
      extractItems(xml).slice(0, 4).map((item) => ({
        title: item.title,
        url: item.link,
        snippet: item.description,
        source: normalizeSource(item.link),
        kind: classifyItem(item.title, item.description),
      })),
    );

    const filtered = dedupeByUrl(results).slice(0, 8);
    const competitorCount = filtered.filter((item) => item.kind === "competitor").length;
    const alternativeCount = filtered.filter((item) => item.kind === "alternative").length;

    const payload: ResearchState = {
      status: filtered.length ? "ready" : "error",
      query,
      items: filtered,
      summary: `已抓到 ${filtered.length} 条候选证据，其中 ${competitorCount} 条可视作竞品，${alternativeCount} 条可视作替代服务。`,
      updatedAt: new Date().toISOString(),
    };

    return NextResponse.json(payload);
  } catch (error) {
    const payload: ResearchState = {
      status: "error",
      query,
      items: [],
      summary: "联网搜索失败。",
      error: error instanceof Error ? error.message : "unknown error",
      updatedAt: new Date().toISOString(),
    };
    return NextResponse.json(payload, { status: 500 });
  }
}
