# Original Runtime Integration

This clean-site build intentionally preserves the original interaction runtime instead of replacing it with a lookalike implementation.

The generated HTML in `site/` is copied from the currently working local mirror after content/localization edits. Static runtime chunks, fonts, WebGL files, and media are exported with the site for GitHub Pages.

Core original modules studied and kept as runtime dependencies:

- runtime-source/semantic/app/home/page-and-map.compiled.js
- runtime-source/semantic/app/about/page.compiled.js
- runtime-source/semantic/components/preloader/client-boot.compiled.js
- runtime-source/semantic/components/transition/transition-wrapper.compiled.js
- runtime-source/semantic/components/scroll/lenis.compiled.js
- runtime-source/semantic/components/webgl/webgl-scene.compiled.js
- runtime-source/semantic/components/navigation/navigation.compiled.js
- runtime-source/semantic/components/navigation/logo.compiled.js
- runtime-source/semantic/components/navigation/trails-toggle-store-and-box.compiled.js
- runtime-source/semantic/stores/transition-store.compiled.js
- runtime-source/semantic/stores/refs-store.compiled.js

Routes generated as one EN/CN system:

- /en
- /en/profile
- /en/journal
- /en/gallery
- /en/contact
- /cn
- /cn/profile
- /cn/journal
- /cn/gallery
- /cn/contact

Next cleanup step: split the existing generator logic into route, locale, navigation, transition, journal, gallery, and asset modules without changing the runtime behavior.
