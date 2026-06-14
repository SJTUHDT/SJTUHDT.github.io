const siteConfig = window.SITE_CONFIG || {};
const siteLocale = window.SITE_LOCALE || siteConfig.locale || "en";
const navToggle = document.querySelector(".nav-toggle");
const gmtClock = document.querySelector("[data-gmt-clock]");
const isHomePage = document.body.classList.contains("home-page");
const pageId = document.body.dataset.page || (isHomePage ? "home" : "");
const pathSegments = window.location.pathname.split("/").filter(Boolean);
const localeIndex = pathSegments.findIndex(segment => segment === "en" || segment === "cn");
const localeSegment = localeIndex >= 0 ? pathSegments[localeIndex] : siteLocale;
const routeDepth = localeIndex >= 0 ? Math.max(0, pathSegments.length - localeIndex - 1) : 0;
const relativePrefix = levels => "../".repeat(Math.max(0, levels));

const escapeHtml = value => String(value ?? "")
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;")
  .replaceAll("'", "&#039;");

const getPageHref = route => `${relativePrefix(routeDepth)}${route}/`;

const getHomeHref = () => (
  routeDepth === 0 ? "./" : relativePrefix(routeDepth)
);

const getSharedAssetBase = () => {
  if (localeIndex < 0) return "./assets/";
  return `${relativePrefix(routeDepth + 1)}assets/`;
};

const getAssetHref = value => {
  const path = String(value || "");
  const match = path.match(/^(?:\.\.\/|\.\/)*assets\/(.+)$/);
  return match ? `${getSharedAssetBase()}${match[1]}` : path;
};

const renderSiteLogos = () => {
  const logos = [...document.querySelectorAll("[data-site-logo]")].filter(logo => !logo.dataset.logoLoaded);

  if (!logos.length) {
    return;
  }

  const logoUrl = `${getSharedAssetBase()}HDTs_PAGE_vector.svg`;
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const applyLogoMarkup = svgMarkup => {
      logos.forEach(logo => {
        const isHomeLogo = logo.closest(".home-logo-link");
        logo.innerHTML = isHomeLogo
          ? `
            <span class="site-logo-layer site-logo-layer-base" aria-hidden="true">${svgMarkup}</span>
            <span class="site-logo-layer site-logo-layer-highlight" aria-hidden="true">${svgMarkup}</span>
          `
          : svgMarkup;
        logo.toggleAttribute("data-logo-layers", Boolean(isHomeLogo));
        logo.dataset.logoLoaded = "true";

        logo.querySelectorAll("svg").forEach(svg => {
          svg.removeAttribute("width");
          svg.removeAttribute("height");
          svg.setAttribute("aria-hidden", "true");
          svg.setAttribute("focusable", "false");
        });

        logo.querySelectorAll("[fill]").forEach(element => {
          if (element.getAttribute("fill") !== "none") {
            element.setAttribute("fill", "currentColor");
          }
        });

        const animationRoots = logo.matches("[data-logo-layers]")
          ? [...logo.querySelectorAll(".site-logo-layer")]
          : [logo];

        animationRoots.forEach(root => {
          root.querySelectorAll("path, polygon, rect, circle, ellipse").forEach((shape, index) => {
            shape.style.transformBox = "fill-box";
            shape.style.transformOrigin = "center";
            shape.style.animationDelay = `${index * 50}ms`;
          });
        });

        const playLogoAnimation = () => {
          if (reducedMotion) {
            return;
          }

          if (logo.dataset.logoAnimationRunning === "true") {
            return;
          }

          window.clearTimeout(Number(logo.dataset.logoAnimationTimer || 0));
          logo.dataset.logoAnimationRunning = "true";
          logo.classList.remove("is-animating");
          logo.getBoundingClientRect();
          logo.classList.add("is-animating");

          logo.dataset.logoAnimationTimer = String(window.setTimeout(() => {
            logo.classList.remove("is-animating");
            logo.dataset.logoAnimationRunning = "false";
          }, 1240));
        };

        const trigger = logo.closest("a") || logo;
        trigger.addEventListener("pointerenter", playLogoAnimation);
        trigger.addEventListener("mouseenter", playLogoAnimation);
        trigger.addEventListener("mouseover", playLogoAnimation);
        trigger.addEventListener("focus", playLogoAnimation);
      });
  };

  const showLogoFallback = () => {
    logos.forEach(logo => {
      logo.dataset.logoLoaded = "true";
      logo.textContent = "HDT's PAGE";
    });
  };

  const request = new XMLHttpRequest();
  request.open("GET", logoUrl, true);
  request.onload = () => {
    if (request.status >= 200 && request.status < 300) {
      applyLogoMarkup(request.responseText);
      return;
    }

    showLogoFallback();
  };
  request.onerror = showLogoFallback;
  request.send();
};

const getLocaleHomeHref = locale => {
  if (locale === siteLocale) return getHomeHref();
  return `${relativePrefix(routeDepth + 1)}${locale}/`;
};

const renderLanguageSwitcher = element => {
  if (!element) return;

  element.innerHTML = ["en", "cn"].map(locale => {
    const label = locale.toUpperCase();
    const current = locale === siteLocale ? ' aria-current="page"' : "";
    return `<a href="${escapeHtml(getLocaleHomeHref(locale))}"${current}>${label}</a>`;
  }).join(" / ");
};

const applySiteConfig = () => {
  if (!siteConfig.siteName) {
    return;
  }

  document.documentElement.dataset.siteData = "loaded";
  document.documentElement.lang = siteLocale === "cn" ? "zh-CN" : "en";

  const page = siteConfig.pages?.[pageId];

  if (page?.title) {
    document.title = pageId === "home"
      ? page.title
      : `${page.title}${siteConfig.titleSeparator || " | "}${siteConfig.siteName}`;
  }

  document.querySelectorAll(".brand").forEach(brand => {
    brand.href = getHomeHref();
    brand.setAttribute("aria-label", siteLocale === "cn" ? `${siteConfig.siteName}首页` : `${siteConfig.siteName} home`);
    const label = brand.querySelector("[data-site-name]");
    if (label) {
      label.textContent = siteConfig.siteName;
    }
  });

  renderSiteLogos();

  document.querySelectorAll(".site-nav").forEach(nav => {
    if (!Array.isArray(siteConfig.nav)) {
      return;
    }

    const currentNavId = pageId === "journalEntry" ? "journal" : pageId;

    nav.querySelectorAll("a").forEach((link, index) => {
      const item = siteConfig.nav[index];
      if (!item) {
        return;
      }

      link.href = getPageHref(item.route);
      link.textContent = item.label;
      if (currentNavId) {
        link.toggleAttribute("aria-current", item.id === currentNavId);
      }
    });
  });

  const home = siteConfig.home || {};
  const setText = (selector, value) => {
    const element = document.querySelector(selector);
    if (element && value !== undefined) {
      element.textContent = value;
    }
  };
  const setHtml = (selector, value) => {
    const element = document.querySelector(selector);
    if (element && value !== undefined) {
      element.innerHTML = value;
    }
  };
  const setPair = (selector, values) => {
    const element = document.querySelector(selector);
    if (!element || !Array.isArray(values)) {
      return;
    }

    element.querySelectorAll("span").forEach((span, index) => {
      if (values[index] !== undefined) {
        span.textContent = values[index];
      }
    });
  };

  setText("[data-home-kicker]", home.kicker);
  renderLanguageSwitcher(document.querySelector("[data-home-language]"));
  setText("[data-home-copyright]", home.copyright);
  setHtml("[data-home-title-base]", home.title);
  setHtml("[data-home-title-highlight]", home.title);

  const homeTitle = document.querySelector(".home-title");
  if (homeTitle && home.titlePlain) {
    homeTitle.setAttribute("aria-label", home.titlePlain);
  }

  setPair("[data-home-side-left]", home.sideLeft);
  setPair("[data-home-side-right]", home.sideRight);
  setPair("[data-home-bottom-one]", home.bottomCenter?.[0]);
  setPair("[data-home-bottom-two]", home.bottomCenter?.[1]);
  setHtml("[data-home-scale-left]", home.scaleLeft);
  setHtml("[data-home-scale-right]", home.scaleRight);

  setText("[data-gallery-kicker]", siteConfig.gallery?.kicker);
  setText("[data-gallery-intro]", siteConfig.gallery?.intro);
  setText("[data-gallery-note]", siteConfig.gallery?.note);

  const contact = siteConfig.contact || {};
  setText("[data-contact-title]", contact.title);
  setText("[data-contact-description]", contact.description);
  setText("[data-contact-tagline]", contact.tagline);

  const contactBg = document.querySelector("[data-contact-bg]");
  if (contactBg && contact.background) {
    contactBg.src = getAssetHref(contact.background);
  }

  const contactEmail = document.querySelector("[data-contact-email]");
  if (contactEmail && contact.email) {
    const emails = Array.isArray(contact.email) ? contact.email : [contact.email];
    contactEmail.innerHTML = emails.map(email => escapeHtml(email)).join("<br>");
    contactEmail.toggleAttribute("aria-disabled", !contact.emailHref);
    contactEmail.href = contact.emailHref || "#";
  }

  const contactPhone = document.querySelector("[data-contact-phone]");
  if (contactPhone && contact.phone) {
    contactPhone.textContent = contact.phone;
    contactPhone.toggleAttribute("aria-disabled", !contact.phoneHref);
    contactPhone.href = contact.phoneHref || "#";
  }

  setText("[data-contact-address]", contact.address);
  setText("[data-contact-address-note]", contact.addressNote);

  const contactPrimary = document.querySelector("[data-contact-primary]");
  if (contactPrimary) {
    contactPrimary.href = contact.emailHref || "#";
    contactPrimary.toggleAttribute("aria-disabled", !contact.emailHref);
  }

  const contactLocations = document.querySelector("[data-contact-locations]");
  if (contactLocations && Array.isArray(contact.locations)) {
    contactLocations.innerHTML = contact.locations.map(location => `<li>${escapeHtml(location)}</li>`).join("");
  }
};

applySiteConfig();

if (navToggle) {
  navToggle.addEventListener("click", () => {
    const isOpen = document.body.classList.toggle("nav-open");
    navToggle.setAttribute("aria-expanded", String(isOpen));
  });
}

if (gmtClock) {
  const gmtFormatter = new Intl.DateTimeFormat("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
    timeZone: "GMT"
  });

  const updateGmtClock = () => {
    gmtClock.textContent = `${gmtFormatter.format(new Date())} GMT`;
  };

  updateGmtClock();
  window.setInterval(updateGmtClock, 1000);
}

(() => {
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const transitionStorageKey = "personalHomePageTransition";
  const shapes = {
    center: "polygon(50% 50%,50% 50%,50% 50%,50% 50%,50% 50%,50% 50%,50% 50%,50% 50%,50% 50%,50% 50%,50% 50%)",
    mid: "polygon(43.5% 45.2%,46.7% 40.9%,51.4% 39.9%,55.7% 44.3%,56.8% 48%,56.7% 51.4%,57.4% 54.9%,55.2% 60%,50% 61.9%,47.3% 59.2%,44.3% 54.8%)",
    full: "polygon(0% 50%,0 0,100% 0%,100% 50%,100% 50%,100% 100%,50% 100%,50% 100%,50% 100%,0 100%,0 100%)"
  };
  let isLeaving = false;

  const hasIncomingTransition = () => {
    try {
      return window.sessionStorage.getItem(transitionStorageKey) === "incoming";
    } catch (error) {
      return document.documentElement.classList.contains("page-transition-cold-cover");
    }
  };

  const markIncomingTransition = () => {
    try {
      window.sessionStorage.setItem(transitionStorageKey, "incoming");
    } catch (error) {
      return;
    }
  };

  const clearIncomingTransition = () => {
    try {
      window.sessionStorage.removeItem(transitionStorageKey);
    } catch (error) {
      return;
    }
  };

  const afterPaint = callback => {
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(callback);
    });
  };

  const ensureTransitionCover = () => {
    let cover = document.querySelector(".page-transition-cover");

    if (!cover) {
      cover = document.createElement("div");
      cover.className = "page-transition-cover";
      cover.setAttribute("aria-hidden", "true");
      document.body.appendChild(cover);
    }

    return cover;
  };

  const setCoverShape = (cover, shape) => {
    cover.style.clipPath = shape;
    cover.style.webkitClipPath = shape;
  };

  const playCoverAnimation = (direction, done) => {
    const cover = ensureTransitionCover();
    const entering = direction === "enter";
    const frames = entering
      ? [
          { clipPath: shapes.full, webkitClipPath: shapes.full, offset: 0 },
          { clipPath: shapes.mid, webkitClipPath: shapes.mid, offset: 0.48, easing: "cubic-bezier(.87,0,.13,1)" },
          { clipPath: shapes.center, webkitClipPath: shapes.center, offset: 1, easing: "cubic-bezier(.33,1,.68,1)" }
        ]
      : [
          { clipPath: shapes.center, webkitClipPath: shapes.center, offset: 0 },
          { clipPath: shapes.mid, webkitClipPath: shapes.mid, offset: 0.52, easing: "cubic-bezier(.33,1,.68,1)" },
          { clipPath: shapes.full, webkitClipPath: shapes.full, offset: 1, easing: "cubic-bezier(.87,0,.13,1)" }
        ];

    document.documentElement.classList.add("page-transition-active");
    cover.classList.add("is-visible");
    setCoverShape(cover, entering ? shapes.full : shapes.center);

    if (prefersReducedMotion || typeof cover.animate !== "function") {
      setCoverShape(cover, entering ? shapes.center : shapes.full);
      window.setTimeout(done, 80);
      return;
    }

    const animation = cover.animate(frames, {
      duration: entering ? 980 : 860,
      delay: entering ? 90 : 0,
      fill: "forwards",
      easing: "linear"
    });

    animation.onfinish = () => {
      setCoverShape(cover, entering ? shapes.center : shapes.full);
      done();
    };
  };

  const finishEnter = () => {
    if (!hasIncomingTransition()) {
      document.documentElement.classList.remove("page-transition-active", "page-transition-cold-cover");
      return;
    }

    const cover = ensureTransitionCover();
    cover.classList.add("is-visible");
    setCoverShape(cover, shapes.full);
    cover.getBoundingClientRect();
    clearIncomingTransition();

    afterPaint(() => {
      window.setTimeout(() => {
        document.documentElement.classList.remove("page-transition-cold-cover");
      }, 90);

      playCoverAnimation("enter", () => {
        cover.classList.remove("is-visible");
        document.documentElement.classList.remove("page-transition-active");
      });
    });
  };

  const shouldTransition = (event, link) => {
    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey ||
      link.target ||
      link.hasAttribute("download")
    ) {
      return false;
    }

    const destination = new URL(link.getAttribute("href"), window.location.href);
    const current = new URL(window.location.href);

    if (destination.origin !== current.origin) {
      return false;
    }

    if (destination.pathname === current.pathname && destination.search === current.search) {
      return false;
    }

    return true;
  };

  document.addEventListener("click", event => {
    const link = event.target.closest("a[href]");

    if (!link || isLeaving || !shouldTransition(event, link)) {
      return;
    }

    event.preventDefault();
    isLeaving = true;

    const destination = new URL(link.getAttribute("href"), window.location.href);
    playCoverAnimation("leave", () => {
      markIncomingTransition();
      window.location.assign(destination.href);
    });
  }, true);

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", finishEnter, { once: true });
  } else {
    finishEnter();
  }
})();

const journalStorageKey = `personalHomePageJournalEntries:${siteLocale}:titles-20260614`;

const getJournalEntries = () => {
  const sourceEntries = window.JOURNAL_ENTRIES || [];

  try {
    const savedEntries = JSON.parse(window.localStorage.getItem(journalStorageKey) || "[]");
    return sourceEntries.map(entry => {
      const savedEntry = savedEntries.find(item => item.slug === entry.slug);
      return savedEntry ? { ...entry, ...savedEntry } : entry;
    });
  } catch (error) {
    return sourceEntries;
  }
};

const saveJournalEntry = entry => {
  try {
    const savedEntries = JSON.parse(window.localStorage.getItem(journalStorageKey) || "[]");
    const nextEntries = savedEntries.filter(item => item.slug !== entry.slug);
    nextEntries.push(entry);
    window.localStorage.setItem(journalStorageKey, JSON.stringify(nextEntries));
  } catch (error) {
    return;
  }
};

(() => {
  const journal = document.querySelector("[data-journal]");

  if (!journal) {
    return;
  }

  const entries = getJournalEntries();
  const mediaRoot = journal.querySelector("[data-journal-media-root]");
  const slidesRoot = journal.querySelector("[data-journal-slides]");
  const totalLabel = journal.querySelector("[data-journal-total]");
  const formatIndex = index => String(index + 1).padStart(2, "0");
  const formatCount = count => String(count).padStart(2, "0");
  const trailMarkup = `
    <div class="journal-slide-trail" aria-hidden="true">
      <svg class="journal-trail-line" viewBox="-8 0 64 820" preserveAspectRatio="none">
        <path d="M23.75.06c-.7 5.9 1.42 6.15.72 12.04s-6.03 5.26-6.74 11.16 1.34 6.14.64 12.04-8.56 4.96-9.27 10.85 5.61 6.65 4.91 12.55-2.88 5.64-3.58 11.54 5.38 6.62 4.68 12.52-1.27 5.83-1.98 11.73-10.45 4.74-11.15 10.64c-.48 4.03 10.46 9.34 10.04 13.37s-1.26 7.96-1.61 12-6.69 7.61-6.96 11.65 3.93 8.36 3.72 12.41 2.1 8.15 1.96 12.2-4.22 7.96-4.29 12.01-3.3 8.09-3.3 12.15 9.6 7.99 9.67 12.05S.37 211.3.5 215.36s.99 8.13 1.19 12.18.58 8.14.86 12.19 2.95 7.94 3.29 11.98-5.23 8.69-4.83 12.72 9.14 7.2 9.62 11.22-.25 8.19.3 12.2c.82 6.08-1.34 6.38-.52 12.46s5.33 5.47 6.16 11.55-3.22 6.63-2.4 12.71-4.99 6.87-4.17 12.95 8.2 5.08 9.02 11.16 6.8 5.27 7.63 11.35-12.29 7.86-11.47 13.94 9.56 4.9 10.39 10.98-2.24 6.5-1.42 12.58 3.02 5.78 3.85 11.87-6.41 7.06-5.59 13.15 5.97 5.39 6.8 11.47-2.92 6.59-2.09 12.67 11.07 4.69 11.9 10.78-7.08 7.16-6.26 13.24 3.45 5.73 4.28 11.81-6.13 7.02-5.3 13.11 6.49 5.32 7.32 11.4 6.15 5.36 6.98 11.44-.07 6.21.75 12.3-8.71 7.38-7.89 13.47c.52 3.81 14.6 6.01 14.99 9.82s-3.71 8.2-3.44 12.03-8.66 8.13-8.5 11.96 4.39 7.44 4.43 11.28 3.1 7.68 3.01 11.52 4.67 7.97 4.47 11.8.4 7.92.08 11.75-4.35 7.43-4.79 11.25 1.67 8.1 1.1 11.9c-.87 5.89.32 6.07-.56 11.96s-7.21 4.95-8.08 10.84-.74 5.91-1.61 11.8-1.43 5.81-2.3 11.7 3.7 6.57 2.83 12.46.77 6.14-.11 12.03.28 6.06-.59 11.96-8.69 4.73-9.56 10.62-1.64 5.78-2.51 11.67 6.59 7 5.72 12.9-10.61 4.45-11.49 10.34-3.09 5.57-3.97 11.46 9 7.36 8.12 13.26"></path>
      </svg>
      <svg class="journal-eye" viewBox="0 0 62 62">
        <circle cx="31" cy="31" r="28.5"></circle>
        <path class="journal-eye-shape" d="m49.58 30.83-5.88 7.41-13.29 2.59-12.71-4-6.47-6 11.53-9.29 7.65-.71 12.35 2.94z"></path>
        <path class="journal-eye-pupil" d="M31.23 24.75c-3.44 0-6.24 2.79-6.24 6.24s2.79 6.24 6.24 6.24 6.24-2.79 6.24-6.24-2.79-6.24-6.24-6.24m3.33 5.24c0 .83-2 1-2 1-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5c2.5 0 2 2 2 2"></path>
      </svg>
    </div>
  `;

  if (mediaRoot && slidesRoot && entries.length) {
    mediaRoot.innerHTML = entries.map((entry, index) => `
      <div class="journal-media-set${index === 0 ? " is-active" : ""}" data-journal-media="${index}">
        <figure class="journal-image-frame journal-media-primary"><img src="${escapeHtml(getAssetHref(entry.images[0]))}" alt=""></figure>
        <figure class="journal-image-frame journal-media-secondary"><img src="${escapeHtml(getAssetHref(entry.images[1]))}" alt=""></figure>
      </div>
    `).join("");

    slidesRoot.innerHTML = entries.map((entry, index) => `
      <article class="journal-slide${index === 0 ? " is-active" : ""}" data-journal-slide>
        ${trailMarkup}
        <span class="journal-count">${formatIndex(index)} / ${formatCount(entries.length)}</span>
        <a class="journal-title-link" href="./entry/?entry=${encodeURIComponent(entry.slug)}">
          <h1>${escapeHtml(entry.title)}</h1>
        </a>
        <p>${escapeHtml(entry.date)} / ${escapeHtml(entry.subtitle)}</p>
      </article>
    `).join("");
  }

  if (totalLabel) {
    totalLabel.textContent = formatCount(entries.length || 0);
  }

  const slides = [...journal.querySelectorAll("[data-journal-slide]")];
  const mediaSets = [...journal.querySelectorAll("[data-journal-media]")];
  const slideTrack = journal.querySelector(".journal-slides");
  const currentLabel = journal.querySelector("[data-journal-current]");
  const trailTemplate = journal.querySelector(".journal-slide-trail");
  let currentIndex = 0;
  let locked = false;
  let touchY = 0;

  if (trailTemplate) {
    slides.forEach(slide => {
      if (!slide.querySelector(".journal-slide-trail")) {
        slide.prepend(trailTemplate.cloneNode(true));
      }
    });
  }

  const applyJournalIndex = index => {
    currentIndex = Math.max(0, Math.min(index, slides.length - 1));

    if (slideTrack) {
      slideTrack.style.transform = `translate3d(0, ${-currentIndex * window.innerHeight}px, 0)`;
    }

    slides.forEach((slide, slideIndex) => {
      slide.classList.toggle("is-active", slideIndex === currentIndex);
    });

    mediaSets.forEach((set, setIndex) => {
      set.classList.toggle("is-active", setIndex === currentIndex);
    });

    if (currentLabel) {
      currentLabel.textContent = formatIndex(currentIndex);
    }
  };

  const stepJournal = direction => {
    if (locked) {
      return;
    }

    const nextIndex = Math.max(0, Math.min(currentIndex + direction, slides.length - 1));

    if (nextIndex === currentIndex) {
      return;
    }

    locked = true;
    applyJournalIndex(nextIndex);
    window.setTimeout(() => {
      locked = false;
    }, 680);
  };

  window.addEventListener("wheel", event => {
    if (Math.abs(event.deltaY) < 8) {
      return;
    }

    event.preventDefault();
    stepJournal(event.deltaY > 0 ? 1 : -1);
  }, { passive: false });

  window.addEventListener("keydown", event => {
    const down = ["ArrowDown", "PageDown", " "].includes(event.key);
    const up = ["ArrowUp", "PageUp"].includes(event.key);

    if (!down && !up) {
      return;
    }

    event.preventDefault();
    stepJournal(down ? 1 : -1);
  });

  window.addEventListener("touchstart", event => {
    touchY = event.touches[0]?.clientY || 0;
  }, { passive: true });

  window.addEventListener("touchmove", event => {
    const y = event.touches[0]?.clientY || touchY;
    const delta = touchY - y;

    if (Math.abs(delta) < 18) {
      return;
    }

    event.preventDefault();
    touchY = y;
    stepJournal(delta > 0 ? 1 : -1);
  }, { passive: false });

  window.addEventListener("resize", () => applyJournalIndex(currentIndex));
  applyJournalIndex(0);
})();

(() => {
  const gallery = document.querySelector("[data-gallery]");

  if (!gallery) {
    return;
  }

  const loop = gallery.querySelector("[data-gallery-loop]");
  const items = siteConfig.gallery?.items || [];
  const columnCount = window.matchMedia("(max-width: 860px)").matches ? 2 : 4;
  const columns = Array.from({ length: columnCount }, () => []);

  items.forEach((item, index) => {
    columns[index % columnCount].push(item);
  });

  if (loop && items.length) {
    loop.innerHTML = columns.map((column, columnIndex) => {
      const repeatedItems = [...column, ...column];

      return `
        <div class="gallery-loop-column" data-gallery-column="${columnIndex}">
          <div class="gallery-loop-track">
            ${repeatedItems.map((item, itemIndex) => `
              <figure class="gallery-loop-card">
                <img src="${escapeHtml(getAssetHref(item.src))}" alt="${escapeHtml(item.alt || `Gallery image ${itemIndex + 1}`)}" loading="lazy">
              </figure>
            `).join("")}
          </div>
        </div>
      `;
    }).join("");
  }

  const tracks = [...gallery.querySelectorAll(".gallery-loop-track")];

  if (!tracks.length) {
    return;
  }

  const state = {
    velocity: 0,
    targetVelocity: 0,
    friction: 0.82,
    positions: tracks.map((track, index) => (index % 2 === 0 ? 0 : -track.scrollHeight / 2))
  };

  const wrapGalleryPosition = (value, halfHeight) => {
    if (!halfHeight) {
      return 0;
    }

    let next = value;

    while (next < -halfHeight) next += halfHeight;
    while (next > 0) next -= halfHeight;

    return next;
  };

  const setInitialTrackPositions = () => {
    tracks.forEach((track, index) => {
      const halfHeight = track.scrollHeight / 2;
      state.positions[index] = index % 2 === 0 ? 0 : -halfHeight / 2;
      track.style.transform = `translate3d(0, ${state.positions[index]}px, 0)`;
    });
  };

  const animateColumns = () => {
    state.velocity += (state.targetVelocity - state.velocity) * 0.1;
    state.targetVelocity *= state.friction;

    tracks.forEach((track, index) => {
      const halfHeight = track.scrollHeight / 2;
      const direction = index % 2 === 0 ? 1 : -1;
      const drift = 0.18 * direction;
      const pushed = state.velocity * direction;
      state.positions[index] = wrapGalleryPosition(state.positions[index] + drift + pushed, halfHeight);
      track.style.transform = `translate3d(0, ${state.positions[index].toFixed(2)}px, 0)`;
    });

    window.requestAnimationFrame(animateColumns);
  };

  const addVelocity = value => {
    state.targetVelocity += value * 0.15;
  };

  window.addEventListener("wheel", event => {
    event.preventDefault();
    addVelocity(event.deltaY);
  }, { passive: false });

  let touchY = 0;

  window.addEventListener("touchstart", event => {
    touchY = event.touches[0]?.clientY || 0;
  }, { passive: true });

  window.addEventListener("touchmove", event => {
    const y = event.touches[0]?.clientY || touchY;
    addVelocity(touchY - y);
    touchY = y;
  }, { passive: true });

  window.addEventListener("resize", setInitialTrackPositions);
  window.setTimeout(setInitialTrackPositions, 120);
  setInitialTrackPositions();
  animateColumns();
})();

(() => {
  const detailRoot = document.querySelector("[data-journal-detail]");

  if (!detailRoot) {
    return;
  }

  const entries = getJournalEntries();
  const detailText = siteConfig.journalDetail || {};
  const params = new URLSearchParams(window.location.search);
  const slug = params.get("entry") || entries[0]?.slug || "";
  const entry = entries.find(item => item.slug === slug) || entries[0];

  if (!entry) {
    detailRoot.innerHTML = `<p class="journal-detail-fallback">${escapeHtml(detailText.notFound || "No journal entry found.")}</p>`;
    return;
  }

  document.title = `${entry.title}${siteConfig.titleSeparator || " | "}${siteConfig.pages?.journal?.title || "Journal"}`;
  detailRoot.innerHTML = `
    <div class="journal-detail-actions">
      <a class="journal-detail-back" href="../">${escapeHtml(detailText.back || "Back")}</a>
      <button class="journal-detail-button" type="button" data-journal-edit>${escapeHtml(detailText.edit || "Edit")}</button>
      <button class="journal-detail-button journal-detail-save" type="button" data-journal-save hidden>${escapeHtml(detailText.save || "Save")}</button>
    </div>
    <article class="journal-detail-article">
      <header class="journal-detail-header">
        <p class="journal-detail-date" data-edit-field="date">${escapeHtml(entry.date)}</p>
        <h1 data-edit-field="title">${escapeHtml(entry.title)}</h1>
        <p data-edit-field="subtitle">${escapeHtml(entry.subtitle)}</p>
      </header>
      <section class="journal-detail-media" aria-label="${escapeHtml(entry.title)} images">
        <figure>
          <img src="${escapeHtml(getAssetHref(entry.images[0]))}" alt="">
          <label class="journal-image-editor">${escapeHtml(detailText.imageLabel || "Image")} 1 <input value="${escapeHtml(entry.images[0])}" data-edit-image="0" disabled></label>
        </figure>
        <figure>
          <img src="${escapeHtml(getAssetHref(entry.images[1]))}" alt="">
          <label class="journal-image-editor">${escapeHtml(detailText.imageLabel || "Image")} 2 <input value="${escapeHtml(entry.images[1])}" data-edit-image="1" disabled></label>
        </figure>
      </section>
      <section class="journal-detail-body">
        ${entry.body.map(paragraph => `<p data-edit-body>${escapeHtml(paragraph)}</p>`).join("")}
      </section>
    </article>
  `;

  const editButton = detailRoot.querySelector("[data-journal-edit]");
  const saveButton = detailRoot.querySelector("[data-journal-save]");
  const editableFields = [...detailRoot.querySelectorAll("[data-edit-field], [data-edit-body]")];
  const imageInputs = [...detailRoot.querySelectorAll("[data-edit-image]")];

  const setEditable = isEditable => {
    detailRoot.classList.toggle("is-editing", isEditable);
    editableFields.forEach(field => {
      field.contentEditable = String(isEditable);
    });
    imageInputs.forEach(input => {
      input.disabled = !isEditable;
    });
    if (editButton) {
      editButton.hidden = isEditable;
    }
    if (saveButton) {
      saveButton.hidden = !isEditable;
    }
  };

  imageInputs.forEach(input => {
    input.addEventListener("input", () => {
      const image = input.closest("figure")?.querySelector("img");
      if (image) {
        image.src = getAssetHref(input.value.trim());
      }
    });
  });

  editButton?.addEventListener("click", () => {
    setEditable(true);
    detailRoot.querySelector("[data-edit-field='title']")?.focus();
  });

  saveButton?.addEventListener("click", () => {
    const updatedEntry = {
      ...entry,
      date: detailRoot.querySelector("[data-edit-field='date']")?.innerText.trim() || entry.date,
      title: detailRoot.querySelector("[data-edit-field='title']")?.innerText.trim() || entry.title,
      subtitle: detailRoot.querySelector("[data-edit-field='subtitle']")?.innerText.trim() || entry.subtitle,
      images: imageInputs.map(input => input.value.trim()).filter(Boolean),
      body: [...detailRoot.querySelectorAll("[data-edit-body]")]
        .map(paragraph => paragraph.innerText.trim())
        .filter(Boolean)
    };

    saveJournalEntry(updatedEntry);
    document.title = `${updatedEntry.title}${siteConfig.titleSeparator || " | "}${siteConfig.pages?.journal?.title || "Journal"}`;
    setEditable(false);
  });
})();

if (isHomePage) {
  const rootStyle = document.body.style;
  const visualPanel = document.querySelector(".home-visual-panel");
  const homeTitle = document.querySelector(".home-title");
  const homeLogo = document.querySelector(".home-logo-link .site-logo");
  const visualState = {
    isDragging: false,
    lastX: 0,
    lastY: 0,
    panX: 0,
    panY: 0,
    scale: 1
  };
  const base = {
    sidebarWidth: 350,
    frameLeft: 40,
    frameRight: 55,
    frameTop: 40,
    frameBottom: 40
  };
  let targetZoom = 0;
  let currentZoom = 0;
  let previousZoom = 0;
  let lastWheelAt = 0;

  const clampZoom = value => Math.max(0, Math.min(1, value));
  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
  const updateHomeColorSplits = () => {
    if (!visualPanel) {
      return;
    }

    const visualLeft = visualPanel.getBoundingClientRect().left;

    if (homeTitle) {
      const titleRect = homeTitle.getBoundingClientRect();
      const titleSplit = Math.max(0, Math.min(titleRect.width, visualLeft - titleRect.left));
      rootStyle.setProperty("--home-title-split", `${titleSplit}px`);
    }

    if (homeLogo) {
      const logoRect = homeLogo.getBoundingClientRect();
      const logoSplit = Math.max(0, Math.min(logoRect.width, visualLeft - logoRect.left));
      rootStyle.setProperty("--home-logo-split", `${logoSplit}px`);
    }
  };

  const panBounds = scale => {
    if (!visualPanel) {
      return { x: 0, y: 0 };
    }

    const rect = visualPanel.getBoundingClientRect();
    return {
      x: Math.max(0, rect.width * (scale - 1) / 2),
      y: Math.max(0, rect.height * (scale - 1) / 2)
    };
  };

  const setVisualPan = (x, y, scale = visualState.scale) => {
    const bounds = panBounds(scale);
    visualState.panX = clamp(x, -bounds.x, bounds.x);
    visualState.panY = clamp(y, -bounds.y, bounds.y);
    rootStyle.setProperty("--home-pan-x", `${visualState.panX}px`);
    rootStyle.setProperty("--home-pan-y", `${visualState.panY}px`);
  };

  const updateVisualTransform = zoom => {
    const imageScale = 1 + zoom * 0.34;
    visualState.scale = imageScale;
    rootStyle.setProperty("--home-image-scale", imageScale.toFixed(4));

    if (zoom < 0.03) {
      setVisualPan(0, 0, imageScale);
      return;
    }

    setVisualPan(visualState.panX * zoom / Math.max(previousZoom, 0.001), visualState.panY * zoom / Math.max(previousZoom, 0.001), imageScale);
  };

  const updateFogLayer = (zoom, isShrinking) => {
    const shrinkProgress = 1 - zoom;
    const settledOpacity = zoom < 0.12 ? 0.22 : 0;
    const transitionOpacity = isShrinking ? Math.sin(shrinkProgress * Math.PI) * 0.48 : 0;
    const fogOpacity = Math.max(settledOpacity, transitionOpacity);
    const fogY = 34 - shrinkProgress * 34;
    const fogDrift = Math.sin(shrinkProgress * Math.PI * 1.4) * 16;

    rootStyle.setProperty("--home-fog-opacity", Math.max(0, fogOpacity).toFixed(4));
    rootStyle.setProperty("--home-fog-y", `${fogY.toFixed(2)}%`);
    rootStyle.setProperty("--home-fog-drift", `${fogDrift.toFixed(2)}px`);
  };

  const applyHomeZoom = zoom => {
    const chromeOpacity = 1 - zoom;
    const isShrinking = zoom < previousZoom - 0.0005;

    rootStyle.setProperty("--home-sidebar-width", `${base.sidebarWidth * chromeOpacity}px`);
    rootStyle.setProperty("--frame-left", `${base.frameLeft * chromeOpacity}px`);
    rootStyle.setProperty("--frame-right", `${base.frameRight * chromeOpacity}px`);
    rootStyle.setProperty("--frame-top", `${base.frameTop * chromeOpacity}px`);
    rootStyle.setProperty("--frame-bottom", `${base.frameBottom * chromeOpacity}px`);
    rootStyle.setProperty("--frame-chrome-opacity", chromeOpacity.toFixed(4));
    rootStyle.setProperty("--home-sidebar-opacity", Math.max(0, 1 - zoom * 1.5).toFixed(4));
    rootStyle.setProperty("--home-sidebar-shift", `${-40 * zoom}px`);

    document.body.classList.toggle("home-image-fullscreen", zoom > 0.55);
    updateVisualTransform(zoom);
    updateFogLayer(zoom, isShrinking);
    updateHomeColorSplits();
    previousZoom = zoom;
  };

  const animateHomeZoom = () => {
    currentZoom += (targetZoom - currentZoom) * 0.13;

    if (Math.abs(targetZoom - currentZoom) < 0.001) {
      currentZoom = targetZoom;
    }

    applyHomeZoom(currentZoom);
    window.requestAnimationFrame(animateHomeZoom);
  };

  const setHomeZoomTarget = zoom => {
    targetZoom = clampZoom(zoom);
  };

  window.addEventListener("wheel", event => {
    const now = Date.now();

    if (now - lastWheelAt < 60) {
      event.preventDefault();
      return;
    }

    if (Math.abs(event.deltaY) < 6) {
      return;
    }

    event.preventDefault();
    lastWheelAt = now;
    setHomeZoomTarget(event.deltaY < 0 ? 1 : 0);
  }, { passive: false });

  if (visualPanel) {
    visualPanel.addEventListener("pointerdown", event => {
      if (currentZoom <= 0.55) {
        return;
      }

      event.preventDefault();
      visualState.isDragging = true;
      visualState.lastX = event.clientX;
      visualState.lastY = event.clientY;
      document.body.classList.add("home-image-dragging");
      visualPanel.setPointerCapture(event.pointerId);
    });

    visualPanel.addEventListener("pointermove", event => {
      if (!visualState.isDragging) {
        return;
      }

      event.preventDefault();
      const nextX = visualState.panX + event.clientX - visualState.lastX;
      const nextY = visualState.panY + event.clientY - visualState.lastY;
      visualState.lastX = event.clientX;
      visualState.lastY = event.clientY;
      setVisualPan(nextX, nextY);
    });

    const stopDrag = event => {
      if (!visualState.isDragging) {
        return;
      }

      visualState.isDragging = false;
      document.body.classList.remove("home-image-dragging");
      if (visualPanel.hasPointerCapture(event.pointerId)) {
        visualPanel.releasePointerCapture(event.pointerId);
      }
    };

    visualPanel.addEventListener("pointerup", stopDrag);
    visualPanel.addEventListener("pointercancel", stopDrag);
  }

  animateHomeZoom();
}
