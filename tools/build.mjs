import fs from "fs";
import path from "path";

const cleanRoot = path.resolve(import.meta.dirname, "..");
const workspaceRoot = cleanRoot;
const sourceRoot = path.join(cleanRoot, "source-routes");
const outRoot = path.join(cleanRoot, "site");

const routes = [
  ["en", "index.html"],
  ["en/profile", "index.html"],
  ["en/journal", "index.html"],
  ["en/gallery", "index.html"],
  ["en/contact", "index.html"],
  ["cn", "index.html"],
  ["cn/profile", "index.html"],
  ["cn/journal", "index.html"],
  ["cn/gallery", "index.html"],
  ["cn/contact", "index.html"],
];

const sourceModules = [
  "runtime-source/semantic/app/home/page-and-map.compiled.js",
  "runtime-source/semantic/app/about/page.compiled.js",
  "runtime-source/semantic/components/preloader/client-boot.compiled.js",
  "runtime-source/semantic/components/transition/transition-wrapper.compiled.js",
  "runtime-source/semantic/components/scroll/lenis.compiled.js",
  "runtime-source/semantic/components/webgl/webgl-scene.compiled.js",
  "runtime-source/semantic/components/navigation/navigation.compiled.js",
  "runtime-source/semantic/components/navigation/logo.compiled.js",
  "runtime-source/semantic/components/navigation/trails-toggle-store-and-box.compiled.js",
  "runtime-source/semantic/stores/transition-store.compiled.js",
  "runtime-source/semantic/stores/refs-store.compiled.js",
];

const aliasRuntime = `const localeBase=location.pathname.startsWith("/en")?"/en":"/cn";const aliases=Object.fromEntries([
  ["en","about","profile"],["en","projects","journal"],["en","playground","gallery"],
  ["cn","about","profile"],["cn","projects","journal"],["cn","playground","gallery"]
].map(([locale,from,to])=>["/"+locale+"/"+from,"/"+locale+"/"+to]).concat([
  ["/"+"about",localeBase+"/profile"],["/"+"projects",localeBase+"/journal"],["/"+"playground",localeBase+"/gallery"]
]));`;

function copyRoute(route, file) {
  const source = path.join(sourceRoot, route, file);
  const target = path.join(outRoot, route, file);
  if (!fs.existsSync(source)) {
    throw new Error(`Missing source route: ${source}`);
  }
  fs.mkdirSync(path.dirname(target), { recursive: true });
  let html = sanitizeHtml(fs.readFileSync(source, "utf8"));
  if (route.startsWith("cn")) html = injectCnNavigationNormalizer(html);
  if (route === "cn") html = injectCnHomeUrlRestore(html);
  fs.writeFileSync(target, html);
}

function injectCnNavigationNormalizer(html) {
  if (html.includes("clean-cn-navigation-normalizer")) return html;
  const script = `<script id="clean-cn-navigation-normalizer">(()=>{const items=[["/cn","地图",1],["/cn/profile","简历",2],["/cn/journal","日志",3],["/cn/gallery","作品集",4],["/cn/contact","联系",5]];let normalizing=false;function leafText(el,text){const leaves=[...el.querySelectorAll("div,span,p")].filter((node)=>node.children.length===0&&node.textContent.trim());const target=leaves.at(-1);if(target&&target.textContent!==text)target.textContent=text;else if(!target&&el.textContent!==text)el.textContent=text}function normalize(){if(normalizing)return;normalizing=true;try{const nav=document.querySelector(".c-icons");if(!nav)return;const direct=[...nav.children].filter((el)=>el.tagName==="A");items.forEach(([href,label,order],index)=>{const link=direct[index]||nav.querySelector(":scope > a[href='"+href+"']");if(!link)return;if(link.getAttribute("href")!==href)link.setAttribute("href",href);link.style.setProperty("display","flex","important");link.style.setProperty("order",String(order),"important");leafText(link,label);if(href==="/cn")link.dataset.active="true";else link.removeAttribute("data-active")});const language=[...nav.children].find((el)=>el.tagName==="DIV"&&el.querySelectorAll("a").length>=2);if(language){language.style.setProperty("order","110","important");language.style.setProperty("text-transform","uppercase","important");const links=[...language.querySelectorAll("a")];if(links[0]){if(links[0].getAttribute("href")!=="/cn")links[0].setAttribute("href","/cn");if(links[0].textContent!=="CN")links[0].textContent="CN";links[0].dataset.active="true";links[0].classList.add("text-forest-green","font-bold")}if(links[1]){if(links[1].getAttribute("href")!=="/en")links[1].setAttribute("href","/en");if(links[1].textContent!=="EN")links[1].textContent="EN";links[1].removeAttribute("data-active");links[1].classList.remove("font-bold")}}}finally{normalizing=false}}document.addEventListener("DOMContentLoaded",()=>setTimeout(normalize,0));window.addEventListener("load",()=>setTimeout(normalize,100));let ticks=0;const timer=setInterval(()=>{normalize();ticks+=1;if(ticks>320)clearInterval(timer)},90);new MutationObserver(()=>setTimeout(normalize,0)).observe(document.documentElement,{subtree:true,childList:true})})();</script>`;
  return html.replace("</head>", `${script}</head>`);
}

function injectCnHomeUrlRestore(html) {
  if (html.includes("clean-cn-home-url-restore")) return html;
  const script = `<script id="clean-cn-home-url-restore">(()=>{const wanted="/cn"+location.search+location.hash;let ticks=0;function restore(){if(location.pathname==="/en")history.replaceState(history.state,"",wanted);ticks+=1;if(ticks>80)clearInterval(timer)}const timer=setInterval(restore,120);window.addEventListener("load",()=>setTimeout(restore,160));setTimeout(restore,900);setTimeout(restore,1800);setTimeout(restore,3200)})();</script>`;
  return html.replace("</head>", `${script}</head>`);
}

function directImageUrl(rawSource) {
  const withoutHtmlParams = rawSource.split("&")[0];
  const withoutEscapedParams = withoutHtmlParams.split("\\u0026")[0];
  const decoded = decodeURIComponent(withoutEscapedParams).split("?")[0];
  if (decoded.startsWith("/")) return decoded;

  try {
    const sourceUrl = new URL(decoded);
    if (sourceUrl.hostname.includes("datocms-assets.com")) {
      return `/assets/sanrita/${path.basename(sourceUrl.pathname)}`;
    }
    return `/assets/sanrita/${path.basename(sourceUrl.pathname)}`;
  } catch {
    return decoded;
  }
}

function rewriteNextImageUrl(match, source) {
  return directImageUrl(source);
}

function sanitizeHtml(html) {
  return html
    .replace(/<link\b(?=[^>]*href=["']https:\/\/www\.googletagmanager\.com\/gtag\/js\?id=[^"']*["'])[^>]*>/g, "")
    .replace(/<script\b(?=[^>]*id=["']google-analytics["'])[^>]*>[\s\S]*?<\/script>/g, "")
    .replace(/gtag\([^)]*\);?/g, "")
    .replace(/G-51KMFQH4N4/g, "")
    .replace(/const aliases=\{[^}]*\};/g, aliasRuntime)
    .replace(/const routeMap = \{[\s\S]*?\n  \};/g, `const routeMap = {
    "/en": "/cn",
    "/en/profile": "/cn/profile",
    "/en/journal": "/cn/journal",
    "/en/gallery": "/cn/gallery",
    "/en/contact": "/cn/contact"
  };`)
    .replace(/https:\/\/www\.datocms-assets\.com\/116050\/([^"'<>\s\\?]+)(?:\?[^"'<>\s\\]*)?/g, (_match, filename) => `/assets/sanrita/${filename}`)
    .replace(/https:\\\/\\\/www\.datocms-assets\.com\\\/116050\\\/([^"'<>\\?\s]+)(?:\\\?[^"'<>\\\s]*)?/g, (_match, filename) => `/assets/sanrita/${filename}`)
    .replace(/https:\/\/www\.datocms-a/g, "/assets/sanrita/")
    .replace(/https:\\\/\\\/www\.datocms-a/g, "/assets/sanrita/")
    .replace(/ssets\.com\/116050\//g, "")
    .replace(/ssets\\.com\\\/116050\\\//g, "")
    .replace(/https:\/\/i\.ytimg\.com\/vi\/[^"'<>\s\\]+\/([^"'<>\s\\?]+)/g, (_match, filename) => `/assets/sanrita/${filename}`)
    .replace(/https:\/\/image\.mux\.com\/[^"'<>\s\\]+\/([^"'<>\s\\?]+)/g, (_match, filename) => `/assets/sanrita/${filename}`)
    .replace(/https:\/\/stream\.mux\.com\/[^"'<>\s\\]+\/([^"'<>\s\\?]+)/g, (_match, filename) => `/assets/sanrita/${filename}`)
    .replace(/https:\/\/(?:www\.)?youtube\.com\/(?:watch\?v=|shorts\/)[^"'<>\s\\]+/g, "#")
    .replace(/https:\/\/youtu\.be\/[^"'<>\s\\]+/g, "#")
    .replace(/https:\/\/sanrita\.ca/g, "")
    .replace(/https:\/\/www\.instagram\.com\/sanrita\.atelier\/?/g, "")
    .replace(/https:\/\/www\.linkedin\.com\/company\/sanrita\/posts\/\?feedView=all/g, "")
    .replace(/https:\/\/www\.linkedin\.com\/company\/sanrita\/?/g, "")
    .replace(/https:\/\/www\.googletagmanager\.com\/gtag\/js\?id=[^"'<>\s\\]*/g, "")
    .replace(/\/_next\/image\?url=([^"'<>\s),\\]+)/g, rewriteNextImageUrl)
    .replace(/(\/assets\/sanrita\/[^"'<>\\\s?,]+\.(?:webp|jpg|jpeg|png|svg))\?auto=format(?:&amp;|\\u0026|&)[^"'<>\\\s,]*/g, "$1")
    .replace(/(\/assets\/sanrita\/[^"'<>\\\s?,]+\.(?:webp|jpg|jpeg|png|svg))(?:&amp;|\\u0026|&)[^"'<>\\\s,]*/g, "$1")
    .replace(/\/local\/profile-background\.png/g, "/assets/personal/transition-topography.png");
}

function writeRuntimeIndex() {
  const lines = [
    "# Original Runtime Integration",
    "",
    "This clean-site build intentionally preserves the original interaction runtime instead of replacing it with a lookalike implementation.",
    "",
    "The generated HTML in `site/` is copied from the currently working local mirror after content/localization edits. Static runtime chunks, fonts, WebGL files, and media are exported with the site for GitHub Pages.",
    "",
    "Core original modules studied and kept as runtime dependencies:",
    "",
    ...sourceModules.map((file) => `- ${file}`),
    "",
    "Routes generated as one EN/CN system:",
    "",
    ...routes.map(([route]) => `- /${route}`),
    "",
    "Next cleanup step: split the existing generator logic into route, locale, navigation, transition, journal, gallery, and asset modules without changing the runtime behavior.",
    "",
  ];
  fs.writeFileSync(path.join(cleanRoot, "SOURCE-INTEGRATION.md"), lines.join("\n"));
}

fs.rmSync(outRoot, { recursive: true, force: true });
for (const [route, file] of routes) copyRoute(route, file);
writeRuntimeIndex();

console.log(`Built ${routes.length} integrated routes into ${outRoot}`);
