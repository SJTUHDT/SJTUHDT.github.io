# Clean Personal Site

This folder is the independent integration workspace. It does not modify the existing local mirror and patch system in the workspace root.

Important: this version preserves the original site runtime and interaction logic. It is not a separate visual remake.

## Local Entry

```bash
cd clean-site
npm run build:routes
node server.js
```

Open:

```text
http://127.0.0.1:8010/cn
```

## Routes

- `/en`
- `/en/profile`
- `/en/journal`
- `/en/gallery`
- `/en/contact`
- `/cn`
- `/cn/profile`
- `/cn/journal`
- `/cn/gallery`
- `/cn/contact`

## Current Source Shape

Generated route files live in:

```text
site/
```

GitHub Pages output is exported to:

```text
dist/
```

The original runtime analysis and module list are in:

```text
SOURCE-INTEGRATION.md
```

The local preview server reads original runtime assets from the workspace root:

```text
assets/
fonts/
pictures/
webgl/
_next/
```

No external San Rita, DatoCMS, Instagram, LinkedIn, YouTube, or Mux links should be used by this clean version. The next cleanup step is splitting the existing generator into route, locale, navigation, transition, journal, gallery, and asset modules without changing behavior.

## GitHub Pages

```bash
npm run build
```

The build creates a pure static `dist/` folder for GitHub Pages, including:

- route HTML at `/cn`, `/en`, and their subpages
- runtime assets under `_next/`
- local media/assets/fonts/WebGL files
- `CNAME` for `hdt.wiki`
- `.nojekyll` so `_next/` is served normally
