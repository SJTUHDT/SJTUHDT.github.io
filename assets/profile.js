(() => {
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const reveals = Array.from(document.querySelectorAll(".reveal"));

  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
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
    reveals.forEach((item) => item.classList.add("is-visible"));
  }

  const stack = document.querySelector("[data-stack]");
  const photos = Array.from(document.querySelectorAll(".stack-photo"));

  const updateStack = () => {
    if (!stack || !photos.length || reduced) return;

    const rect = stack.getBoundingClientRect();
    const travel = Math.max(1, rect.height - window.innerHeight);
    const progress = Math.min(1, Math.max(0, -rect.top / travel));

    photos.forEach((photo, index) => {
      const step = index / Math.max(1, photos.length - 1);
      const distance = Math.abs(progress - step);
      const active = Math.max(0, 1 - distance * 3.2);
      const y = (index - progress * (photos.length - 1)) * 26;
      const x = (index - 2) * 15;
      const rotate = [-7, 5, -3, 7, -5][index];

      photo.style.setProperty("--active", active.toFixed(3));
      photo.style.setProperty("--y", `${y.toFixed(2)}px`);
      photo.style.setProperty("--x", `${x}px`);
      photo.style.setProperty("--r", `${rotate}deg`);
      photo.style.zIndex = String(20 + index + Math.round(active * 20));
    });
  };

  updateStack();
  window.addEventListener("scroll", updateStack, { passive: true });
  window.addEventListener("resize", updateStack);
})();
