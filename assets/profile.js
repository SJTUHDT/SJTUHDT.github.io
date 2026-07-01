(() => {
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const gsapReady = typeof window.gsap === "object";
  const scrollTriggerReady = gsapReady && typeof window.ScrollTrigger === "function";
  const reveals = Array.from(document.querySelectorAll(".reveal"));
  const stack = document.querySelector("[data-stack]");
  const photos = Array.from(document.querySelectorAll(".stack-photo"));

  const showAll = () => {
    reveals.forEach(item => item.classList.add("is-visible"));
    photos.forEach((photo, index) => {
      photo.style.setProperty("--active", index === 0 ? "1" : "0.38");
      photo.style.setProperty("--y", `${index * 18}px`);
      photo.style.setProperty("--x", `${(index - 2) * 12}px`);
      photo.style.setProperty("--r", `${[-7, 5, -3, 7, -5][index] || 0}deg`);
      photo.style.zIndex = String(20 + photos.length - index);
    });
  };

  if (!gsapReady || reduced) {
    if ("IntersectionObserver" in window && !reduced) {
      const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });

      reveals.forEach((item, index) => {
        item.style.setProperty("--delay", `${Math.min(index % 4, 3) * 90}ms`);
        observer.observe(item);
      });
    } else {
      showAll();
    }

    return;
  }

  document.documentElement.classList.add("gsap-enhanced");

  if (scrollTriggerReady) {
    window.gsap.registerPlugin(window.ScrollTrigger);
  }

  window.gsap.defaults({ ease: "power3.out" });
  window.gsap.set(reveals, { autoAlpha: 0, y: 34 });
  window.gsap.set(".hero-map span", { transformOrigin: "center" });

  window.gsap.timeline({ defaults: { duration: 0.78 } })
    .fromTo(".hero-map span", {
      autoAlpha: 0,
      scale: 0.86,
      rotation: index => [-16, 12, 20, -24][index] || 0
    }, {
      autoAlpha: 1,
      scale: 1,
      rotation: 0,
      stagger: 0.08
    }, 0)
    .fromTo(".personal-logo-link, .hero-copy > *, .profile-card", {
      autoAlpha: 0,
      y: 28
    }, {
      autoAlpha: 1,
      y: 0,
      stagger: 0.07
    }, 0.14);

  if (scrollTriggerReady) {
    window.ScrollTrigger.batch(reveals, {
      start: "top 86%",
      once: true,
      interval: 0.08,
      batchMax: 4,
      onEnter: batch => window.gsap.to(batch, {
        autoAlpha: 1,
        y: 0,
        duration: 0.68,
        stagger: 0.08,
        overwrite: true,
        clearProps: "visibility"
      })
    });

    window.gsap.fromTo(".skill-grid span", {
      autoAlpha: 0,
      y: 24,
      scale: 0.94
    }, {
      autoAlpha: 1,
      y: 0,
      scale: 1,
      duration: 0.64,
      stagger: 0.055,
      scrollTrigger: {
        trigger: ".skill-grid",
        start: "top 82%",
        toggleActions: "play none none none",
        once: true
      }
    });

    const renderStack = progress => {
      photos.forEach((photo, index) => {
        const step = index / Math.max(1, photos.length - 1);
        const distance = Math.abs(progress - step);
        const active = Math.max(0, 1 - distance * 3.15);
        const y = (index - progress * (photos.length - 1)) * 28;
        const x = (index - 2) * 15;
        const rotate = [-7, 5, -3, 7, -5][index] || 0;

        window.gsap.set(photo, {
          "--active": active,
          "--y": `${y.toFixed(2)}px`,
          "--x": `${x}px`,
          "--r": `${rotate}deg`,
          zIndex: 20 + index + Math.round(active * 20)
        });
      });
    };

    renderStack(0);

    if (stack && photos.length) {
      window.ScrollTrigger.create({
        trigger: stack,
        start: "top top",
        end: "bottom bottom",
        scrub: 0.8,
        onUpdate: self => renderStack(self.progress)
      });
    }

    const refreshProfileMotion = () => window.ScrollTrigger.refresh();
    document.fonts?.ready?.then(refreshProfileMotion);
    window.addEventListener("load", refreshProfileMotion, { once: true });
  } else {
    window.gsap.to(reveals, {
      autoAlpha: 1,
      y: 0,
      duration: 0.62,
      stagger: 0.06,
      clearProps: "visibility"
    });
    showAll();
  }
})();
