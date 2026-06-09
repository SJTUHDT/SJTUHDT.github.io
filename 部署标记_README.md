# 部署包标记

这是个人主页整合版部署包。

生成日期：2026-06-09

入口：

```text
/cn
/en
```

本地预览：

```bash
node server.js
```

默认地址：

```text
http://127.0.0.1:8010/cn
```

包含内容：

- `site/`：已生成的 EN/CN 页面
- `_next/`：原站 Next/Turbopack 运行时文件
- `assets/`：本地化图片与替换素材
- `fonts/`：字体文件
- `pictures/`：原站公开图片素材
- `webgl/`：地图 WebGL 资源
- `.cache/routes/`：本地 RSC 缓存兜底
- `tools/build.mjs`：重新生成部署页面的构建脚本
- `source-routes/`：构建脚本使用的页面源文件
- `runtime-source/`：从原站拆出的关键运行时语义源码索引
- `server.js`：自包含本地/部署服务器
- `dist/`：GitHub Pages 静态发布产物，由 `npm run build` 生成

注意：

这个目录是独立部署包，不依赖外层 8000 原镜像体系，也不依赖 `clean-site` 开发目录。GitHub Pages 线上部署使用 `dist/` 静态产物，不依赖 `server.js`。
