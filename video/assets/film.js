// Shared timeline helpers for every scene (numbers from SPEC.md). Deterministic: no clocks, no randomness.
window.film = {
  SCALE: 420 / 390, // app captured at 390 css px, shown 420 px wide in the phone

  /** Video coordinates of a point in the app (css px), for a phone whose left edge is at `phoneLeft`. */
  pt(phoneLeft, cssX, cssY, scroll = 0) {
    return [phoneLeft + 14 + cssX * this.SCALE - 6, 86 + (cssY - scroll) * this.SCALE - 4];
  },

  /** Wrap each word of a line in a span so words can enter one by one. */
  split(sel) {
    document.querySelectorAll(sel).forEach((el) => {
      if (el.dataset.split) return;
      el.dataset.split = "1";
      el.innerHTML = el.innerHTML.replace(/(<[^>]+>)|([^\s<]+)/g, (m, tag, word) => (tag ? tag : `<span class="w">${word}</span>`));
    });
  },

  /** Per-word blur-in (0.13 s, 0.07 s apart), dead still, then a short blur-out. */
  words(tl, sel, inAt, outAt) {
    this.split(sel);
    tl.fromTo(`${sel} .w`, { opacity: 0, filter: "blur(6px)" }, { opacity: 1, filter: "blur(0px)", duration: 0.13, stagger: 0.07, ease: "power2.out" }, inAt);
    if (outAt != null) tl.to(`${sel} .w`, { opacity: 0, filter: "blur(6px)", duration: 0.18, stagger: 0.02, ease: "power3.in" }, outAt);
  },

  /** Out with blur, in with blur, on one stage (0.15 s each). */
  swap(tl, outSel, inSel, at) {
    tl.fromTo(outSel, { opacity: 1, filter: "blur(0px)" }, { opacity: 0, filter: "blur(8px)", duration: 0.15, ease: "power2.in" }, at);
    tl.fromTo(inSel, { opacity: 0, filter: "blur(8px)" }, { opacity: 1, filter: "blur(0px)", duration: 0.15, ease: "power2.out" }, at + 0.1);
  },

  /** Cursor travels to [x, y] and presses at `at`; `from` brings it in from off-screen. */
  tap(tl, sel, [x, y], at, from) {
    const start = from ? { x: from[0], y: from[1] } : undefined;
    if (start) tl.fromTo(sel, start, { x, y, duration: 0.6, ease: "power3.out" }, at - 0.75);
    else tl.to(sel, { x, y, duration: 0.55, ease: "power2.inOut" }, at - 0.7);
    tl.to(sel, { scale: 0.86, duration: 0.1, ease: "power2.out" }, at - 0.1);
    tl.to(sel, { scale: 1, duration: 0.15, ease: "power2.out" }, at);
  },
};
