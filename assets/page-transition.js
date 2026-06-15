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
    } catch (error) {}
  };

  const clearIncomingTransition = () => {
    try {
      window.sessionStorage.removeItem(transitionStorageKey);
    } catch (error) {}
  };

  const afterPaint = callback => {
    window.requestAnimationFrame(() => window.requestAnimationFrame(callback));
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

    return destination.origin === current.origin &&
      (destination.pathname !== current.pathname || destination.search !== current.search);
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
