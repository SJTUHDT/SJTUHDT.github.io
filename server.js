const http = require("http");
const fs = require("fs");
const path = require("path");
const { URL } = require("url");

const siteRoot = __dirname;
const workspaceRoot = siteRoot;
const outputRoot = path.join(siteRoot, "site");
const port = Number(process.env.PORT || 8010);

const mime = {
  ".html": "text/html; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".woff2": "font/woff2",
  ".wasm": "application/wasm",
  ".hdr": "application/octet-stream",
  ".ktx2": "image/ktx2",
  ".glb": "model/gltf-binary",
};

const imageFallbacks = [
  "1770045867-sr-colo-boot-1.webp",
  "1770045987-sr-funky.webp",
  "1770046623-sr-adj-8.webp",
  "1770046807-sr-acco-1.webp",
  "1770047065-sr-pluri-1.webp",
  "1770047188-sr-uk-1.webp",
  "1770047274-sr-srw-eti.webp",
  "1770047767-sr-srw-video.webp",
  "1770047931-sr-tote-bag.webp",
  "1770734012-wilderness-camp.webp",
  "1770734214-owenswater.webp",
  "1770735016-srwfishing.webp",
  "1770734748-sanrita-share-img.webp",
].map((name) => path.join(workspaceRoot, "assets", "sanrita", name));

function fallbackImageFor(source) {
  const available = imageFallbacks.filter((file) => fs.existsSync(file));
  if (!available.length) return "";
  let hash = 0;
  for (const char of source) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  return available[hash % available.length];
}

function safeJoin(root, pathname) {
  const clean = decodeURIComponent(pathname).replace(/^\/+/, "");
  const filePath = path.join(root, clean);
  return filePath.startsWith(root) ? filePath : "";
}

function send(res, filePath) {
  if (!filePath || !fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
    res.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
    res.end("Not found");
    return;
  }

  const ext = path.extname(filePath).toLowerCase();
  res.writeHead(200, {
    "content-type": mime[ext] || "application/octet-stream",
    "cache-control": ext === ".html" ? "no-cache, no-store, must-revalidate" : "public, max-age=3600",
  });
  fs.createReadStream(filePath).pipe(res);
}

function cacheNameFor(reqUrl) {
  const rsc = reqUrl.searchParams.get("_rsc");
  if (!rsc) return "";
  const routePath = reqUrl.pathname.startsWith("/cn")
    ? reqUrl.pathname.replace(/^\/cn/, "/en") || "/en"
    : reqUrl.pathname;
  return routePath.replace(/\//g, "_2F") + "_3F_rsc_3D" + rsc;
}

function handleRsc(reqUrl, res) {
  const name = cacheNameFor(reqUrl);
  if (!name) return false;
  const direct = path.join(workspaceRoot, ".cache", "routes", name);
  if (fs.existsSync(direct)) {
    send(res, direct);
    return true;
  }
  const prefix = name.replace(/_3F_rsc_3D.*$/, "_3F_rsc_3D");
  const cacheDir = path.join(workspaceRoot, ".cache", "routes");
  if (fs.existsSync(cacheDir)) {
    const fallback = fs.readdirSync(cacheDir).find((file) => file.startsWith(prefix));
    if (fallback) {
      send(res, path.join(cacheDir, fallback));
      return true;
    }
  }
  return false;
}

function handleNextImage(reqUrl, res) {
  const source = reqUrl.searchParams.get("url");
  if (!source) {
    res.writeHead(400);
    res.end("Missing image URL");
    return;
  }

  const decodedSource = decodeURIComponent(source);
  let assetName = "";
  try {
    assetName = decodedSource.startsWith("/")
      ? path.basename(new URL(decodedSource, "http://local").pathname)
      : path.basename(new URL(decodedSource).pathname);
  } catch {
    assetName = path.basename(decodedSource.split("?")[0]);
  }

  const localAsset = path.join(workspaceRoot, "assets", "sanrita", assetName);
  const localSource = decodedSource.startsWith("/")
    ? path.join(workspaceRoot, decodedSource)
    : localAsset;

  if (fs.existsSync(localAsset)) {
    send(res, localAsset);
    return;
  }

  if (fs.existsSync(localSource)) {
    send(res, localSource);
    return;
  }

  if (/datocms-assets\.com\/116050\//.test(decodedSource)) {
    const fallback = fallbackImageFor(decodedSource);
    if (fallback) {
      send(res, fallback);
      return;
    }
  }

  res.writeHead(404);
  res.end("Local image not found");
}

http.createServer((req, res) => {
  const reqUrl = new URL(req.url, `http://${req.headers.host}`);
  const pathname = reqUrl.pathname;

  if (reqUrl.searchParams.has("_rsc") && handleRsc(reqUrl, res)) {
    return;
  }

  if (pathname === "/_next/image") {
    handleNextImage(reqUrl, res);
    return;
  }

  if (pathname === "/") {
    send(res, path.join(outputRoot, "cn", "index.html"));
    return;
  }

  const localRoutes = new Map([
    ["/en", path.join(outputRoot, "en", "index.html")],
    ["/en/profile", path.join(outputRoot, "en", "profile", "index.html")],
    ["/en/journal", path.join(outputRoot, "en", "journal", "index.html")],
    ["/en/gallery", path.join(outputRoot, "en", "gallery", "index.html")],
    ["/en/contact", path.join(outputRoot, "en", "contact", "index.html")],
    ["/cn", path.join(outputRoot, "cn", "index.html")],
    ["/cn/profile", path.join(outputRoot, "cn", "profile", "index.html")],
    ["/cn/journal", path.join(outputRoot, "cn", "journal", "index.html")],
    ["/cn/gallery", path.join(outputRoot, "cn", "gallery", "index.html")],
    ["/cn/contact", path.join(outputRoot, "cn", "contact", "index.html")],
  ]);

  if (localRoutes.has(pathname)) {
    send(res, localRoutes.get(pathname));
    return;
  }

  if (pathname === "/local/profile-background.png") {
    send(res, path.join(workspaceRoot, "assets", "personal", "transition-topography.png"));
    return;
  }

  if (pathname.startsWith("/assets/") || pathname.startsWith("/fonts/") || pathname.startsWith("/pictures/") || pathname.startsWith("/webgl/")) {
    send(res, safeJoin(workspaceRoot, pathname));
    return;
  }

  if (pathname.startsWith("/_next/")) {
    send(res, safeJoin(workspaceRoot, pathname));
    return;
  }

  if (pathname.startsWith("/chunks/")) {
    send(res, safeJoin(workspaceRoot, `/_next/static${pathname}`));
    return;
  }

  if (pathname.startsWith("/media/")) {
    send(res, safeJoin(workspaceRoot, `/_next/static${pathname}`));
    return;
  }

  send(res, safeJoin(siteRoot, pathname));
}).listen(port, () => {
  console.log(`Integrated personal site: http://127.0.0.1:${port}/cn`);
});
