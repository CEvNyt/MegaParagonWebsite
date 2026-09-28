// About Team page: controls the District Manager gallery in about-team.html.
// It duplicates the gallery items for a seamless loop, calculates the animation
// distance, updates it on resize, and pauses the moving gallery on hover.
const gallery = document.querySelector("[data-gallery-carousel]");

if (gallery) {
  const viewport = gallery.querySelector(".district-gallery-viewport");
  const track = gallery.querySelector(".district-gallery-track");
  const originalItems = [...track.children];

  // Duplicate the original sequence so the CSS animation can loop continuously.
  originalItems.forEach((item) => track.append(item.cloneNode(true)));
  const updateLoopDistance = () => {
    const gap = parseFloat(getComputedStyle(track).columnGap) || 0;
    const sequenceWidth = originalItems.reduce(
      (total, item) => total + item.getBoundingClientRect().width,
      0,
    );
    track.style.setProperty(
      "--district-gallery-loop-distance",
      `${sequenceWidth + originalItems.length * gap}px`,
    );
  };

  // Recalculate the loop distance when the viewport changes size.
  updateLoopDistance();
  window.addEventListener("resize", updateLoopDistance);
  viewport.addEventListener("mouseenter", () => {
    track.classList.add("is-paused");
  });
  viewport.addEventListener("mouseleave", () => {
    track.classList.remove("is-paused");
  });
}
