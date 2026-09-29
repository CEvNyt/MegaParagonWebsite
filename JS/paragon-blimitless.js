const teamExpanders = document.querySelectorAll(".team-expander");
const animationDuration = 300;

function closeExpander(expander) {
  if (!expander.open) return;
  expander.classList.add("is-closing");
  const branch = expander.closest(".bm-branch");
  branch.style.paddingBottom = "";
  branch.style.marginBottom = "";
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
    window.requestAnimationFrame(() => {
      const expandedHeight = details.scrollHeight + 78;
      if (window.matchMedia("(max-width: 650px)").matches) {
        branch.style.marginBottom = `${expandedHeight}px`;
      } else {
        branch.style.paddingBottom = `${expandedHeight}px`;
      }
    });
  });
});
