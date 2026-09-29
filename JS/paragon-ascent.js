const teamExpanders = document.querySelectorAll(".team-expander");
const animationDuration = 300;

function closeExpander(expander) {
  if (!expander.open) return;
  expander.classList.add("is-closing");
  expander.closest(".bm-branch").style.paddingBottom = "";
  window.setTimeout(() => {
    expander.open = false;
    expander.classList.remove("is-closing");
  }, animationDuration);
}

teamExpanders.forEach((expander) => {
  expander.querySelector("summary").addEventListener("click", (event) => {
    event.preventDefault();
    if (expander.open) {
      closeExpander(expander);
      return;
    }

    teamExpanders.forEach((otherExpander) => {
      if (otherExpander !== expander) closeExpander(otherExpander);
    });

    expander.classList.remove("is-closing");
    expander.open = true;
    const branch = expander.closest(".bm-branch");
    const details = expander.querySelector(".team-details");
    const isLandscapeTablet = window.matchMedia(
      "(min-width: 651px) and (max-width: 1100px) and (orientation: landscape)",
    ).matches;
    const isPortraitTablet = window.matchMedia(
      "(min-width: 651px) and (max-width: 1100px) and (orientation: portrait)",
    ).matches;
    const expansionReserve = isPortraitTablet
      ? 108
      : isLandscapeTablet
        ? 24
        : 48;
    branch.style.paddingBottom = `${details.offsetHeight + expansionReserve}px`;
  });
});
