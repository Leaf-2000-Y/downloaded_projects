const http = require("http");
const { spawn, spawnSync } = require("child_process");
const fs = require("fs");
const fsp = require("fs/promises");
const os = require("os");
const path = require("path");

const port = Number(process.env.PORT || 8004);
const host = process.env.HOST || "0.0.0.0";
const publicDir = path.join(__dirname, "public");
const generatedDir = path.join(publicDir, "generated", "runs");
const codexTimeoutMs = Number(process.env.CODEX_IMAGE_TIMEOUT_MS || 600000);
const demoOnly = process.env.DEMO_ONLY === "1";
const extraPaths = [
  path.dirname(process.execPath),
  path.join(os.homedir(), ".local", "bin"),
  "/opt/homebrew/bin",
  "/usr/local/bin",
  "/usr/bin"
];

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".svg": "image/svg+xml; charset=utf-8"
};

function sendJson(res, status, payload) {
  res.writeHead(status, { "content-type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(payload));
}

function readJsonBody(req, maxBytes = 25 * 1024 * 1024) {
  return new Promise((resolve, reject) => {
    let size = 0;
    let raw = "";

    req.on("data", (chunk) => {
      size += chunk.length;
      if (size > maxBytes) {
        reject(new Error("请求体过大"));
        req.destroy();
        return;
      }
      raw += chunk;
    });

    req.on("end", () => {
      if (!raw) {
        resolve({});
        return;
      }

      try {
        resolve(JSON.parse(raw));
      } catch {
        reject(new Error("请求 JSON 格式错误"));
      }
    });

    req.on("error", reject);
  });
}

function buildImagePrompt(body) {
  const config = body.config || {};
  const mode = body.mode || "room";
  const isRoomEffect = mode === "room";
  const modeText = {
    layout: "家具布置平面图，top-down apartment floor plan with furniture layout",
    colored: "彩色室内平面图，presentation-ready colored floor plan",
    axon: "45 degree 3D isometric axonometric apartment model",
    room: `one separate photorealistic interior perspective rendering for the ${config.roomType || "selected room"} only`,
    enhance: "enhanced premium photorealistic interior rendering with better texture and lighting"
  }[mode] || "interior design visualization";

  const sourceContext = body.sourceName
    ? [
        `The user uploaded a reference floor plan image named "${body.sourceName}".`,
        "You must use that uploaded image as the primary structural source.",
        "Do not invent a different demo apartment layout.",
        isRoomEffect
          ? `Use the uploaded plan only to understand the approximate location, boundaries, doors, windows, and adjacency of the target room: ${config.roomType || "selected room"}.`
          : "Keep the uploaded plan's room count, room positions, wall outline, door/window openings, balcony position, kitchen/bathroom position, and circulation relationship as much as possible.",
        isRoomEffect
          ? "Do not output the full apartment plan, colored floor plan, top-down view, isometric view, or multi-room cutaway."
          : "Only add furniture, color, material, or rendering style according to the current workflow step."
      ].join(" ")
    : "No source image is attached, create a coherent compact apartment demo result from the text brief.";

  const roomEffectRules = isRoomEffect
    ? [
        `Room effect target: ${config.roomType || "selected room"}.`,
        "Generate exactly one interior render for this room only.",
        "Camera: eye-level or slightly wide-angle standing inside the room, showing walls, ceiling, floor, furniture, materials, and lighting.",
        "Do not generate a floor plan, whole-home layout, axonometric apartment model, dollhouse view, or overhead plan.",
        "The result should look like a real interior design rendering for a single room."
      ].join("\n")
    : "";

  return [
    "Use case: sketch-to-render.",
    "Asset type: local web app generated result for an AI interior design workflow.",
    `Primary request: create ${modeText}.`,
    roomEffectRules,
    `Project: ${config.projectName || "interior design project"}.`,
    `Room type: ${config.roomType || "living room"}.`,
    `Style: ${config.style || "modern minimalist"}.`,
    `Materials: ${config.material || "wood floor, white wall, fabric furniture"}.`,
    `Lighting: ${config.lighting || "bright natural daylight"}.`,
    `User brief: ${config.roomBrief || ""}`,
    `Constraints: ${config.advancedPrompt || "keep layout coherent, avoid distorted space, no watermark, no UI chrome"}.`,
    sourceContext,
    "Output: portrait 3:4 composition, clean professional presentation, no watermark, no brand logos, no UI chrome.",
    body.sourceName
      ? isRoomEffect
        ? `Critical: output a single-room interior effect for ${config.roomType || "the selected room"}, not the uploaded floor plan itself.`
        : "Critical: the output must visibly correspond to the uploaded floor plan, not to a generic sample layout."
      : ""
  ].join("\n");
}

function safeFilename(value) {
  return String(value || "image")
    .replace(/[^a-z0-9_-]+/gi, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80)
    .toLowerCase();
}

function codexEnv() {
  const mergedPath = [process.env.PATH || "", ...extraPaths].filter(Boolean).join(":");
  return { ...process.env, PATH: mergedPath };
}

function hasCodexCli() {
  if (demoOnly) {
    return { ok: false, version: "demo-only" };
  }

  const result = spawnSync("codex", ["--version"], {
    env: codexEnv(),
    encoding: "utf8"
  });
  const stdout = result.stdout || "";
  const stderr = result.stderr || "";
  return {
    ok: result.status === 0,
    version: stdout.trim() || stderr.trim()
  };
}

async function generateImage(body) {
  if (demoOnly) {
    const error = new Error("公网演示模式已关闭真实 AI 生成");
    error.status = 400;
    throw error;
  }

  const codex = hasCodexCli();
  if (!codex.ok) {
    const error = new Error("本地服务找不到 codex CLI，或 Codex CLI 未正确安装");
    error.status = 400;
    throw error;
  }

  const prompt = buildImagePrompt(body);
  const mode = safeFilename(body.mode);
  const filename = `${Date.now()}-${mode}.png`;
  await fsp.mkdir(generatedDir, { recursive: true });

  const workDir = path.join(
    generatedDir,
    `.gen-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
  );
  await fsp.mkdir(workDir, { recursive: true });

  const refImagePaths = [];
  if (typeof body.sourceImageData === "string" && body.sourceImageData.startsWith("data:image/")) {
    const match = body.sourceImageData.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/);
    if (match) {
      const extension = match[1].includes("jpeg") ? "jpg" : match[1].split("/")[1].replace(/\W/g, "");
      const refPath = path.join(workDir, `reference.${extension || "png"}`);
      await fsp.writeFile(refPath, Buffer.from(match[2], "base64"));
      refImagePaths.push(refPath);
      const refStat = await fsp.stat(refPath);
      console.log(`[generate] reference image saved: ${refPath} (${refStat.size} bytes)`);
    }
  }

  const fullPrompt = `请使用你的内置图像生成能力生成一张室内设计图片。

生成要求如下：
${prompt}

如果我通过 -i 提供了参考图片：必须以参考图片中的户型/房间/墙体关系作为主要依据，不要使用你自己的默认演示户型，不要生成通用样板房平面。
如果当前模式是房间效果：参考图片只用于理解目标房间位置，最终必须生成单个房间的室内透视效果图，不要输出整套平面图、彩平图、轴侧图或多房间鸟瞰图。

执行要求：
1. 生成一张竖版 3:4 PNG 图片。
2. 生成完成后，把最终图片文件保存到当前工作目录。
3. 文件名必须严格命名为：${filename}
4. 不要保留其它多余图片文件。
5. 不要输出品牌水印、二维码、页面 UI 截图或无关文字。`;

  const args = [
    "exec",
    "-C",
    workDir,
    "--skip-git-repo-check",
    "-s",
    "workspace-write"
  ];
  for (const refPath of refImagePaths) {
    args.push("-i", refPath);
  }
  console.log(`[generate] start mode=${body.mode || "unknown"} refs=${refImagePaths.length} file=${filename}`);

  await new Promise((resolve, reject) => {
    let stderr = "";
    let settled = false;
    const cleanup = () => fsp.rm(workDir, { recursive: true, force: true }).catch(() => {});
    const child = spawn("codex", args, {
      cwd: workDir,
      env: codexEnv(),
      stdio: ["pipe", "pipe", "pipe"]
    });
    child.stdin.end(fullPrompt);

    const timer = setTimeout(() => {
      settled = true;
      child.kill("SIGKILL");
      cleanup();
      reject(new Error(`Codex 生图超时（${Math.round(codexTimeoutMs / 1000)} 秒）`));
    }, codexTimeoutMs);

    child.stdout.on("data", () => {
      // Codex CLI 会输出大量进度文本，前端只需要最终图片。
    });
    child.stderr.on("data", (data) => {
      stderr += data.toString();
    });
    child.on("error", (error) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      cleanup();
      reject(new Error(`无法启动 codex CLI：${error.message}`));
    });
    child.on("close", async () => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      try {
        const src = path.join(workDir, filename);
        await fsp.access(src);
        await fsp.rename(src, path.join(generatedDir, filename));
        await cleanup();
        resolve();
      } catch {
        await cleanup();
        reject(new Error(`Codex CLI 没有产出指定图片文件。${stderr.slice(0, 240)}`));
      }
    });
  });

  return {
    imageUrl: `/generated/runs/${filename}`,
    prompt,
    model: "codex-cli",
    size: "3:4",
    quality: "subscription"
  };
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host || "localhost"}`);

  if (url.pathname === "/health") {
    sendJson(res, 200, { ok: true, port, service: "shengcai-demo" });
    return;
  }

  if (url.pathname === "/api/config") {
    const codex = hasCodexCli();
    sendJson(res, 200, {
      hasCodexCli: codex.ok,
      codexVersion: codex.version,
      demoOnly,
      model: "codex-cli",
      size: "3:4",
      quality: "subscription",
      timeoutMs: codexTimeoutMs
    });
    return;
  }

  if (url.pathname === "/api/generate" && req.method === "POST") {
    try {
      const body = await readJsonBody(req);
      const result = await generateImage(body);
      sendJson(res, 200, { ok: true, ...result });
    } catch (error) {
      sendJson(res, error.status || 500, {
        ok: false,
        error: error.message || "生成失败"
      });
    }
    return;
  }

  const requestedPath = url.pathname === "/" ? "/index.html" : url.pathname;
  const filePath = path.normalize(path.join(publicDir, requestedPath));

  if (!filePath.startsWith(publicDir)) {
    res.writeHead(403, { "content-type": "text/plain; charset=utf-8" });
    res.end("Forbidden");
    return;
  }

  fs.readFile(filePath, (error, content) => {
    if (error) {
      res.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
      res.end("Not found");
      return;
    }

    const type = mimeTypes[path.extname(filePath)] || "application/octet-stream";
    res.writeHead(200, { "content-type": type });
    res.end(content);
  });
});

server.listen(port, host, () => {
  console.log(`shengcai-demo listening on http://${host}:${port}`);
});
