import fs from "fs";
import path from "path";

const root = path.resolve(import.meta.dirname, "..");
const siteRoot = path.join(root, "site");
const distRoot = path.join(root, "dist");

const requiredRoutes = [
  "cn/index.html",
  "cn/profile/index.html",
  "cn/journal/index.html",
  "cn/gallery/index.html",
  "cn/contact/index.html",
  "en/index.html",
  "en/profile/index.html",
  "en/journal/index.html",
  "en/gallery/index.html",
  "en/contact/index.html",
];

const staticDirs = ["_next", "assets", "fonts", "pictures", "webgl"];
const staticFiles = ["favicon.svg"];

function copyExisting(source, target) {
  if (!fs.existsSync(source)) return;
  fs.cpSync(source, target, { recursive: true });
}

function writeText(file, contents) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, contents);
}

for (const route of requiredRoutes) {
  const file = path.join(siteRoot, route);
  if (!fs.existsSync(file)) {
    throw new Error(`Missing generated route: ${route}`);
  }
}

fs.rmSync(distRoot, { recursive: true, force: true });
fs.mkdirSync(distRoot, { recursive: true });
fs.cpSync(siteRoot, distRoot, { recursive: true });

for (const dir of staticDirs) {
  copyExisting(path.join(root, dir), path.join(distRoot, dir));
}

for (const file of staticFiles) {
  copyExisting(path.join(root, file), path.join(distRoot, file));
}

writeText(path.join(distRoot, "index.html"), `<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta http-equiv="refresh" content="0; url=/cn/">
    <link rel="canonical" href="/cn/">
    <title>hdt.wiki</title>
    <script>location.replace("/cn/" + location.search + location.hash);</script>
  </head>
  <body>
    <a href="/cn/">Enter hdt.wiki</a>
  </body>
</html>
`);

writeText(path.join(distRoot, "CNAME"), "hdt.wiki\n");
writeText(path.join(distRoot, ".nojekyll"), "");

console.log(`Exported GitHub Pages static site to ${distRoot}`);
