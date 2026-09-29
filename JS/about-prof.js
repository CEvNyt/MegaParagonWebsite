// About Profile page: controls the Company Profile carousel in about-prof.html.
// It manages slide movement, previous/next controls, pagination dots, autoplay,
// and pausing while the carousel is hovered or focused.
const companyCarousel = document.querySelector("[data-company-carousel]");

if (companyCarousel) {
  const track = companyCarousel.querySelector(
    ".profile-company-carousel-track",
  );
  const slides = [
    ...companyCarousel.querySelectorAll(".profile-company-slide"),
  ];
  if (!track || slides.length === 0) {
    companyCarousel.removeAttribute("data-company-carousel");
  } else {
    const realSlideCount = slides.length;
    // Clone the first slide so the final transition loops smoothly back to slide one.
    const firstSlideClone = slides[0].cloneNode(true);
    firstSlideClone.classList.remove("is-active");
    firstSlideClone.setAttribute("aria-hidden", "true");
    track.appendChild(firstSlideClone);
    slides.push(firstSlideClone);
    const dots = [
      ...companyCarousel.querySelectorAll(
        ".profile-company-carousel-dots button",
      ),
    ];
    const previousButton = companyCarousel.querySelector(
      ".profile-company-carousel-prev",
    );
    const nextButton = companyCarousel.querySelector(
      ".profile-company-carousel-next",
    );
    let currentIndex = 0;
    let intervalId;

    // Move the track and keep the active slide and pagination state synchronized.
    const showSlide = (index) => {
      currentIndex = index < 0 ? realSlideCount - 1 : index;
      track.style.transform = `translateX(-${currentIndex * 100}%)`;
      slides.forEach((slide, slideIndex) => {
        slide.classList.toggle("is-active", slideIndex === currentIndex);
      });
      dots.forEach((dot, dotIndex) => {
        const isActive = dotIndex === currentIndex % realSlideCount;
        dot.classList.toggle("is-active", isActive);
        dot.setAttribute("aria-selected", String(isActive));
      });
    };

    // Reset the cloned final slide to the original first slide without a visible jump.
    track.addEventListener("transitionend", () => {
      if (currentIndex !== realSlideCount) return;
      track.style.transition = "none";
      currentIndex = 0;
      track.style.transform = "translateX(0)";
      slides.forEach((slide, slideIndex) => {
        slide.classList.toggle("is-active", slideIndex === 0);
      });
      requestAnimationFrame(() => {
        track.style.transition = "";
      });
    });

    // Restart the five-second autoplay timer after manual navigation or pointer exit.
    const startRotation = () => {
      clearInterval(intervalId);
      intervalId = setInterval(() => showSlide(currentIndex + 1), 5000);
    };

    previousButton?.addEventListener("click", () => {
      showSlide(currentIndex - 1);
      startRotation();
    });
    nextButton?.addEventListener("click", () => {
      showSlide(currentIndex + 1);
      startRotation();
    });
    dots.forEach((dot, dotIndex) => {
      dot.addEventListener("click", () => {
        showSlide(dotIndex);
        startRotation();
      });
    });
    companyCarousel.addEventListener("mouseenter", () =>
      clearInterval(intervalId),
    );
    companyCarousel.addEventListener("mouseleave", startRotation);
    companyCarousel.addEventListener("focusin", () =>
      clearInterval(intervalId),
    );
    companyCarousel.addEventListener("focusout", (event) => {
      if (!companyCarousel.contains(event.relatedTarget)) startRotation();
    });

    showSlide(0);
    startRotation();
  }
}
