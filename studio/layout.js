(function () {
  const gallery = document.querySelector(".gallery");
  if (!gallery) return;

  const figures = Array.from(gallery.querySelectorAll("figure"));
  const lightbox = document.querySelector(".lightbox");
  const lightImg = lightbox && lightbox.querySelector("img");

  function shuffle(items) {
    for (let i = items.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      const swap = items[i];
      items[i] = items[j];
      items[j] = swap;
    }
    return items;
  }

  function avoidClumps(items) {
    for (let i = 1; i < items.length; i += 1) {
      if (items[i].dataset.kind !== items[i - 1].dataset.kind) continue;
      const later = items.findIndex(
        (item, index) => index > i && item.dataset.kind !== items[i].dataset.kind
      );
      if (later === -1) continue;
      const swap = items[i];
      items[i] = items[later];
      items[later] = swap;
    }
    return items;
  }

  shuffle(figures);
  avoidClumps(figures).forEach((figure) => gallery.appendChild(figure));

  const wide = window.matchMedia("(min-width: 760px)").matches;
  figures.forEach((figure) => {
    const land = figure.dataset.orient === "land";
    const mini = figure.dataset.kind === "mini";
    let cols = 1;
    if (wide) {
      if (land) cols = 2;
      else if (mini && Math.random() > 0.45) cols = 2;
      else if (Math.random() > 0.72) cols = 2;
    }
    figure.style.setProperty("--cols", String(cols));
    figure.style.setProperty("--rot", `${(Math.random() * 2.6 - 1.3).toFixed(2)}deg`);
    figure.style.setProperty("--nudge", `${(Math.random() * 22 - 11).toFixed(1)}px`);
  });

  function masonry() {
    const styles = getComputedStyle(gallery);
    const row = parseFloat(styles.gridAutoRows);
    const gap = parseFloat(styles.rowGap) || 0;
    if (!row) return;
    figures.forEach((figure) => {
      figure.style.gridRowEnd = "auto";
      const height = figure.offsetHeight;
      const span = Math.max(1, Math.round((height + gap) / (row + gap)));
      figure.style.gridRowEnd = `span ${span}`;
    });
  }

  function whenReady(img) {
    if (img.complete && img.naturalWidth) return Promise.resolve();
    if (img.decode) return img.decode().catch(() => undefined);
    return new Promise((resolve) => {
      img.addEventListener("load", resolve, { once: true });
      img.addEventListener("error", resolve, { once: true });
    });
  }

  Promise.all(figures.map((figure) => whenReady(figure.querySelector("img"))))
    .then(() => {
      masonry();
      requestAnimationFrame(masonry);
    })
    .finally(() => {
      gallery.classList.add("is-set");
    });

  setTimeout(() => gallery.classList.add("is-set"), 1800);

  window.addEventListener("resize", masonry);

  function openLight(src) {
    if (!lightbox || !lightImg) return;
    lightImg.src = src;
    lightbox.hidden = false;
    document.body.classList.add("is-light");
  }

  function closeLight() {
    if (!lightbox || !lightImg) return;
    lightbox.hidden = true;
    lightImg.removeAttribute("src");
    document.body.classList.remove("is-light");
  }

  gallery.addEventListener("click", (event) => {
    const img = event.target.closest("figure")?.querySelector("img");
    if (!img) return;
    openLight(img.currentSrc || img.src);
  });

  if (lightbox) {
    lightbox.addEventListener("click", closeLight);
  }

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeLight();
  });
})();
