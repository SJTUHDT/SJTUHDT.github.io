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

const hasGsap = () => typeof window.gsap === "object";
const hasScrollTrigger = () => hasGsap() && typeof window.ScrollTrigger === "function";
const prefersReducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if (hasScrollTrigger()) {
  window.gsap.registerPlugin(window.ScrollTrigger);
}

if (hasGsap()) {
  document.documentElement.classList.add("gsap-enhanced");
}

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
  const motionEnabled = hasGsap() && !prefersReducedMotion();
  const activeTransition = { timeline: null, timer: 0 };
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

  const unlockJournal = () => {
    locked = false;
    window.clearTimeout(activeTransition.timer);
  };

  const applyJournalIndex = (index, instant = false) => {
    if (!slides.length) {
      return;
    }

    const previousIndex = currentIndex;
    currentIndex = Math.max(0, Math.min(index, slides.length - 1));

    if (currentLabel) {
      currentLabel.textContent = formatIndex(currentIndex);
    }

    const previousMedia = mediaSets[previousIndex];
    const nextMedia = mediaSets[currentIndex];
    const activeSlide = slides[currentIndex];
    const activeSlideParts = activeSlide
      ? activeSlide.querySelectorAll(".journal-count, .journal-title-link, .journal-slide p, .journal-slide-trail")
      : [];

    slides.forEach((slide, slideIndex) => {
      slide.classList.toggle("is-active", slideIndex === currentIndex);
    });

    if (!motionEnabled) {
      if (slideTrack) {
        slideTrack.style.transform = `translate3d(0, ${-currentIndex * window.innerHeight}px, 0)`;
      }

      mediaSets.forEach((set, setIndex) => {
        set.classList.toggle("is-active", setIndex === currentIndex);
      });
      unlockJournal();
      return;
    }

    if (activeTransition.timeline) {
      activeTransition.timeline.kill();
    }

    if (nextMedia) {
      nextMedia.classList.add("is-active");
    }

    activeTransition.timeline = window.gsap.timeline({
      defaults: { ease: "power3.inOut", overwrite: "auto" },
      onComplete: () => {
        mediaSets.forEach((set, setIndex) => {
          set.classList.toggle("is-active", setIndex === currentIndex);
          if (setIndex !== currentIndex) {
            window.gsap.set(set, { autoAlpha: 0, scale: 1.018 });
          }
        });
        unlockJournal();
      }
    });

    activeTransition.timeline.to(slideTrack, {
      y: -currentIndex * window.innerHeight,
      duration: instant ? 0 : 0.82
    }, 0);

    if (previousMedia && previousMedia !== nextMedia) {
      activeTransition.timeline.to(previousMedia, {
        autoAlpha: 0,
        scale: 1.018,
        duration: instant ? 0 : 0.58,
        ease: "power2.out"
      }, 0);
    }

    if (nextMedia) {
      activeTransition.timeline.fromTo(nextMedia, {
        autoAlpha: instant ? 1 : 0,
        scale: instant ? 1 : 1.025
      }, {
        autoAlpha: 1,
        scale: 1,
        duration: instant ? 0 : 0.92,
        ease: "power2.out"
      }, instant ? 0 : 0.04);
    }

    if (!instant && previousIndex !== currentIndex && activeSlideParts.length) {
      activeTransition.timeline.fromTo(activeSlideParts, {
        autoAlpha: 0,
        y: 26
      }, {
        autoAlpha: 1,
        y: 0,
        duration: 0.62,
        stagger: 0.045,
        ease: "power3.out"
      }, 0.18);
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
    window.clearTimeout(activeTransition.timer);
    activeTransition.timer = window.setTimeout(unlockJournal, motionEnabled ? 980 : 680);
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

  window.addEventListener("resize", () => applyJournalIndex(currentIndex, true));
  applyJournalIndex(0, true);
})();

(() => {
  const gallery = document.querySelector("[data-gallery]");

  if (!gallery) {
    return;
  }

  const loop = gallery.querySelector("[data-gallery-loop]");
  const items = siteConfig.gallery?.items || [];
  const isMobileGallery = window.matchMedia("(max-width: 860px)").matches;
  const columnCount = isMobileGallery ? 2 : 4;
  const columns = Array.from({ length: columnCount }, () => []);
  const galleryTitle = siteConfig.gallery?.title || siteConfig.pages?.gallery?.title || "Gallery";

  items.forEach((item, index) => {
    columns[index % columnCount].push(item);
  });

  if (loop && items.length) {
    loop.innerHTML = columns.map((column, columnIndex) => {
      const mobileIntro = isMobileGallery && columnIndex === 0
        ? `
          <article class="gallery-mobile-intro-card">
            <div class="gallery-mobile-intro-copy">
              <p>${escapeHtml(siteConfig.gallery?.kicker || "")}</p>
              <p>${escapeHtml(siteConfig.gallery?.intro || "")}</p>
              <p>${escapeHtml(siteConfig.gallery?.note || "")}</p>
            </div>
            <ul class="gallery-mobile-title-stack" aria-label="${escapeHtml(galleryTitle)}">
              <li>${escapeHtml(galleryTitle)}</li>
              <li>${escapeHtml(galleryTitle)}</li>
              <li>${escapeHtml(galleryTitle)}</li>
              <li>${escapeHtml(galleryTitle)}</li>
            </ul>
          </article>
        `
        : "";
      const itemMarkup = column.map((item, itemIndex) => `
        <figure class="gallery-loop-card">
          <img src="${escapeHtml(getAssetHref(item.src))}" alt="${escapeHtml(item.alt || `Gallery image ${itemIndex + 1}`)}" loading="eager" decoding="async">
        </figure>
      `);
      const sequence = [mobileIntro, ...itemMarkup].filter(Boolean);
      const repeatedSequence = isMobileGallery ? [...sequence, ...sequence] : [...itemMarkup, ...itemMarkup];

      return `
        <div class="gallery-loop-column" data-gallery-column="${columnIndex}">
          <div class="gallery-loop-track">
            ${repeatedSequence.join("")}
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
    friction: 0.86,
    paused: false,
    hovered: false,
    ready: false,
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
      if (hasGsap()) {
        window.gsap.set(track, { y: state.positions[index] });
      } else {
        track.style.transform = `translate3d(0, ${state.positions[index]}px, 0)`;
      }
    });
  };

  const animateColumns = (deltaRatio = 1) => {
    if (!state.ready || state.paused || document.hidden || prefersReducedMotion()) {
      return;
    }

    state.velocity += (state.targetVelocity - state.velocity) * 0.1;
    state.targetVelocity *= state.friction;

    tracks.forEach((track, index) => {
      const halfHeight = track.scrollHeight / 2;
      const direction = index % 2 === 0 ? 1 : -1;
      const drift = (state.hovered ? 0.045 : 0.18) * direction * deltaRatio;
      const pushed = state.velocity * direction;
      state.positions[index] = wrapGalleryPosition(state.positions[index] + drift + pushed, halfHeight);
      if (hasGsap()) {
        window.gsap.set(track, { y: state.positions[index] });
      } else {
        track.style.transform = `translate3d(0, ${state.positions[index].toFixed(2)}px, 0)`;
      }
    });
  };

  const addVelocity = value => {
    state.targetVelocity += Math.max(-80, Math.min(80, value * 0.14));
  };

  const setGalleryHover = hovered => {
    state.hovered = hovered;
    if (hasGsap()) {
      window.gsap.to(state, {
        targetVelocity: hovered ? 0 : state.targetVelocity,
        duration: 0.42,
        ease: "power2.out",
        overwrite: true
      });
    }
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

  gallery.addEventListener("pointerenter", () => setGalleryHover(true));
  gallery.addEventListener("pointerleave", () => setGalleryHover(false));
  gallery.addEventListener("focusin", () => setGalleryHover(true));
  gallery.addEventListener("focusout", () => setGalleryHover(false));
  document.addEventListener("visibilitychange", () => {
    state.paused = document.hidden;
  });
  const waitForGalleryImages = () => {
    const images = [...gallery.querySelectorAll(".gallery-loop-card img")];
    const imagePromises = images.map(image => {
      if (image.complete && image.naturalWidth > 0) {
        return Promise.resolve();
      }

      if (typeof image.decode === "function") {
        return image.decode().catch(() => {});
      }

      return new Promise(resolve => {
        image.addEventListener("load", resolve, { once: true });
        image.addEventListener("error", resolve, { once: true });
      });
    });

    return Promise.race([
      Promise.all(imagePromises),
      new Promise(resolve => window.setTimeout(resolve, 1400))
    ]);
  };

  const startGalleryMotion = () => {
    setInitialTrackPositions();
    state.ready = true;
    loop?.classList.add("is-ready");

    if (hasGsap()) {
      window.gsap.fromTo(loop, { autoAlpha: 0 }, {
        autoAlpha: 1,
        duration: prefersReducedMotion() ? 0 : 0.42,
        ease: "power2.out",
        clearProps: "visibility"
      });
    }
  };

  window.addEventListener("resize", () => {
    state.ready = false;
    window.requestAnimationFrame(() => {
      setInitialTrackPositions();
      state.ready = true;
    });
  });
  setInitialTrackPositions();

  if (hasGsap()) {
    window.gsap.fromTo(gallery.querySelectorAll(".gallery-copy, .gallery-title-stack"), {
      autoAlpha: 0,
      y: 34,
      scale: 0.97
    }, {
      autoAlpha: 1,
      y: 0,
      scale: 1,
      duration: prefersReducedMotion() ? 0 : 0.72,
      stagger: 0.035,
      ease: "power3.out",
      clearProps: "visibility"
    });
    window.gsap.ticker.add(() => animateColumns(window.gsap.ticker.deltaRatio(60)));
    waitForGalleryImages().then(startGalleryMotion);
  } else {
    const fallbackLoop = () => {
      animateColumns(1);
      window.requestAnimationFrame(fallbackLoop);
    };
    waitForGalleryImages().then(startGalleryMotion);
    fallbackLoop();
  }
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

  if (hasGsap()) {
    const reduced = prefersReducedMotion();
    const introTargets = detailRoot.querySelectorAll(".journal-detail-actions, .journal-detail-header > *, .journal-detail-media figure");
    window.gsap.fromTo(introTargets, {
      autoAlpha: 0,
      y: 34,
      scale: 0.985
    }, {
      autoAlpha: 1,
      y: 0,
      scale: 1,
      duration: reduced ? 0 : 0.78,
      stagger: 0.06,
      ease: "power3.out",
      clearProps: "visibility"
    });

    if (hasScrollTrigger() && !reduced) {
      window.ScrollTrigger.batch(detailRoot.querySelectorAll(".journal-detail-body p"), {
        start: "top 88%",
        once: true,
        onEnter: batch => window.gsap.fromTo(batch, {
          autoAlpha: 0,
          y: 22
        }, {
          autoAlpha: 1,
          y: 0,
          duration: 0.62,
          stagger: 0.07,
          ease: "power2.out",
          clearProps: "visibility"
        })
      });

      const refreshDetailMotion = () => window.ScrollTrigger.refresh();
      detailRoot.querySelectorAll("img").forEach(image => {
        if (image.complete) {
          return;
        }
        image.addEventListener("load", refreshDetailMotion, { once: true });
      });
      document.fonts?.ready?.then(refreshDetailMotion);
    }
  }
})();

(() => {
  const contact = document.querySelector("[data-contact]");

  if (!contact || !hasGsap()) {
    return;
  }

  const reduced = prefersReducedMotion();
  const card = contact.querySelector(".contact-card");
  const background = contact.querySelector(".contact-bg");
  const channels = contact.querySelectorAll(".contact-channel, .contact-locations li, .contact-address-note");

  window.gsap.fromTo([card, ...channels], {
    autoAlpha: 0,
    y: 30,
    scale: 0.985
  }, {
    autoAlpha: 1,
    y: 0,
    scale: 1,
    duration: reduced ? 0 : 0.76,
    stagger: 0.045,
    ease: "power3.out",
    clearProps: "visibility"
  });

  if (reduced || !background || !card) {
    return;
  }

  window.gsap.set(background, { scale: 1.04, transformOrigin: "center" });
  window.gsap.set(card, { transformPerspective: 900, transformOrigin: "center" });

  const bgX = window.gsap.quickTo(background, "x", { duration: 0.65, ease: "power3.out" });
  const bgY = window.gsap.quickTo(background, "y", { duration: 0.65, ease: "power3.out" });
  const rotateX = window.gsap.quickTo(card, "rotationX", { duration: 0.55, ease: "power3.out" });
  const rotateY = window.gsap.quickTo(card, "rotationY", { duration: 0.55, ease: "power3.out" });
  const cardY = window.gsap.quickTo(card, "y", { duration: 0.55, ease: "power3.out" });

  contact.addEventListener("pointermove", event => {
    const rect = contact.getBoundingClientRect();
    const x = (event.clientX - rect.left) / Math.max(1, rect.width) - 0.5;
    const y = (event.clientY - rect.top) / Math.max(1, rect.height) - 0.5;

    bgX(x * -22);
    bgY(y * -18);
    rotateX(y * -2.2);
    rotateY(x * 2.8);
    cardY(y * -5);
  });

  contact.addEventListener("pointerleave", () => {
    bgX(0);
    bgY(0);
    rotateX(0);
    rotateY(0);
    cardY(0);
  });
})();

if (isHomePage) {
  const rootStyle = document.body.style;
  const visualPanel = document.querySelector(".home-visual-panel");
  const homeTitle = document.querySelector(".home-title");
  const homeLogo = document.querySelector(".home-logo-link .site-logo");
  const hasGsap = typeof window.gsap === "object";
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isMobileHome = () => window.matchMedia("(max-width: 860px)").matches;
  const homeCopy = siteLocale === "cn"
    ? {
        enter: ["向上滚动进入影像", "进入后拖动查看细节，向下滚动返回"],
        exit: ["拖动查看细节", "向下滚动或按 Esc 返回地图"]
      }
    : {
        enter: ["Scroll up to enter image mode", "Then drag to inspect, scroll down to return"],
        exit: ["Drag to inspect the image", "Scroll down or press Esc to return"]
      };
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
  let zoomTween = null;
  let currentHintMode = null;
  const zoomState = { zoom: 0 };

  const focusScrim = document.createElement("div");
  focusScrim.className = "home-focus-scrim";
  focusScrim.setAttribute("aria-hidden", "true");
  document.body.appendChild(focusScrim);

  const modeHint = document.createElement("div");
  modeHint.className = "home-mode-hint";
  modeHint.setAttribute("aria-hidden", "true");
  document.body.appendChild(modeHint);

  const clampZoom = value => Math.max(0, Math.min(1, value));
  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
  const writePan = () => {
    rootStyle.setProperty("--home-pan-x", `${visualState.panX.toFixed(2)}px`);
    rootStyle.setProperty("--home-pan-y", `${visualState.panY.toFixed(2)}px`);
  };
  const showModeHint = isFullscreen => {
    if (currentHintMode === isFullscreen) {
      return;
    }

    const copy = isFullscreen ? homeCopy.exit : homeCopy.enter;
    currentHintMode = isFullscreen;

    if (!modeHint.children.length) {
      modeHint.innerHTML = "<span></span><span></span><span></span>";
    }

    modeHint.classList.toggle("is-fullscreen", isFullscreen);
    modeHint.setAttribute("aria-label", `${copy[0]}. ${copy[1]}.`);

    if (hasGsap && !reducedMotion) {
      window.gsap.fromTo(modeHint, {
        autoAlpha: 0,
        y: isFullscreen ? 10 : -8
      }, {
        autoAlpha: 1,
        y: 0,
        duration: 0.32,
        ease: "power2.out",
        overwrite: true
      });
    }
  };

  showModeHint(false);

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

  const setVisualPan = (x, y, scale = visualState.scale, smooth = false) => {
    const bounds = panBounds(scale);
    const nextX = clamp(x, -bounds.x, bounds.x);
    const nextY = clamp(y, -bounds.y, bounds.y);

    if (smooth && hasGsap && !reducedMotion) {
      window.gsap.to(visualState, {
        panX: nextX,
        panY: nextY,
        duration: 0.28,
        ease: "power3.out",
        overwrite: true,
        onUpdate: writePan
      });
      return;
    }

    visualState.panX = nextX;
    visualState.panY = nextY;
    writePan();
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
    rootStyle.setProperty("--home-scrim-opacity", Math.max(0, Math.min(0.86, zoom * 0.86)).toFixed(4));

    document.body.classList.toggle("home-image-fullscreen", zoom > 0.55);
    updateVisualTransform(zoom);
    updateFogLayer(zoom, isShrinking);
    updateHomeColorSplits();
    previousZoom = zoom;
  };

  const animateHomeZoomFallback = () => {
    currentZoom += (targetZoom - currentZoom) * 0.13;

    if (Math.abs(targetZoom - currentZoom) < 0.001) {
      currentZoom = targetZoom;
    }

    applyHomeZoom(currentZoom);
    window.requestAnimationFrame(animateHomeZoomFallback);
  };

  const setHomeZoomTarget = zoom => {
    const nextTarget = clampZoom(zoom);

    const sameTarget = Math.abs(nextTarget - targetZoom) < 0.001;

    if (sameTarget && (zoomTween?.isActive?.() || Math.abs(currentZoom - nextTarget) < 0.001)) {
      return;
    }

    targetZoom = nextTarget;
    if (!sameTarget) {
      showModeHint(targetZoom > 0.55);
    }

    if (reducedMotion) {
      currentZoom = targetZoom;
      zoomState.zoom = targetZoom;
      applyHomeZoom(currentZoom);
      return;
    }

    if (hasGsap) {
      if (zoomTween) {
        zoomTween.kill();
      }

      zoomTween = window.gsap.timeline({
        defaults: { ease: "power3.inOut" },
        onComplete: () => {
          currentZoom = targetZoom;
          zoomState.zoom = targetZoom;
          applyHomeZoom(currentZoom);
        }
      });

      zoomTween.to(zoomState, {
        zoom: targetZoom,
        duration: targetZoom > currentZoom ? 1.04 : 0.78,
        onUpdate: () => {
          currentZoom = zoomState.zoom;
          applyHomeZoom(currentZoom);
        }
      }, 0);

    }
  };

  window.addEventListener("wheel", event => {
    if (isMobileHome()) {
      return;
    }

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

  window.addEventListener("keydown", event => {
    if (event.key === "Escape" && currentZoom > 0.55) {
      setHomeZoomTarget(0);
    }
  });

  window.addEventListener("resize", () => {
    applyHomeZoom(currentZoom);
  });

  if (visualPanel) {
    visualPanel.addEventListener("pointerdown", event => {
      if (currentZoom <= 0.55) {
        showModeHint(false);
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
      setVisualPan(nextX, nextY, visualState.scale, true);
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

  applyHomeZoom(0);

  if (!hasGsap && !reducedMotion) {
    animateHomeZoomFallback();
  }
}
