const menuToggle = document.querySelector(".menu-toggle");
const mainNav = document.querySelector(".main-nav");
const loginLink = mainNav?.querySelector(":scope > .login-link");
const aboutDropdown = mainNav?.querySelector(".about-dropdown");
const mobileBreakpoint = window.matchMedia("(max-width: 760px)");

function placeLoginLink() {
  if (!loginLink || !aboutDropdown) {
    return;
  }

  if (mobileBreakpoint.matches) {
    aboutDropdown.append(loginLink);
  } else {
    mainNav.append(loginLink);
  }
}

if (menuToggle) {
  menuToggle.addEventListener("click", () => {
    const open = menuToggle.getAttribute("aria-expanded") === "true";
    menuToggle.setAttribute("aria-expanded", String(!open));
    mainNav.classList.toggle("open", !open);
  });
}

placeLoginLink();
mobileBreakpoint.addEventListener("change", placeLoginLink);
