/*
ADMIN SYSTEM: CREATE ANNOUNCEMENT FIELDS

- Category: dropdown containing existing categories
- Title: announcement title
- Body: announcement description/content
- Published at: publication date and time
- Location: event or announcement location
- Featured image: uploaded image file
- Actions: Cancel or Save

ADMIN SYSTEM: CATEGORY MANAGEMENT

- Name: category name
- Sort order: numeric display order; lower numbers appear first
- Actions when viewing a category: Edit category or Delete category
- Empty state: "No announcements in this category yet"

PUBLIC API AUTHENTICATION

X-API-key: (value)

PUBLIC API ENDPOINTS

Method | URL | Purpose

GET | /api/v1/announcements | Paginated List, newest first

GET | /api/v1/announcements/{id} | One published announcement

GET | /api/v1/announcements-categories | Categories that have published posts 

PUBLIC API SAMPLE CONNECTION

const res = await fetch('https://themegaparagon.net/api/v1/announcements',{
  headers: {
    'X-Api-Key':'X-Api-Key',
  },
});

const{data} = await res.json();

*/

// Shared announcement connection and rendering for home.html and announcements.html.
// Fetch through PHP so the announcement key stays on the server.
const announcementsApiUrl = "/api/announcements.php";

function getAnnouncementCategory(announcement) {
  return announcement.category?.name || announcement.category || "Announcement";
}

function getCategoryClass(category) {
  const normalizedCategory = category.toLowerCase();
  if (normalizedCategory.includes("event")) return "tag-event";
  if (normalizedCategory.includes("news")) return "tag-news";
  return "tag-announcement";
}

function formatAnnouncementDate(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function populateAnnouncementFilters(announcements) {
  const categoryFilter = document.getElementById("filterCategory");
  const monthFilter = document.getElementById("filterMonth");
  const yearFilter = document.getElementById("filterYear");

  if (categoryFilter) {
    const categories = [
      ...new Map(
        announcements.map((announcement) => {
          const category = getAnnouncementCategory(announcement);
          return [category.toLowerCase(), category];
        }),
      ).entries(),
    ].sort((first, second) => first[1].localeCompare(second[1]));
    categoryFilter.replaceChildren(new Option("All Categories", "all"));
    categories.forEach(([value, label]) => {
      categoryFilter.add(new Option(label, value));
    });
  }

  if (monthFilter) {
    const months = [
      ...new Set(
        announcements.map((announcement) =>
          new Date(announcement.published_at).toLocaleString(undefined, {
            month: "long",
          }),
        ),
      ),
    ].sort((first, second) => first.localeCompare(second));
    monthFilter.replaceChildren(new Option("All Months", "all"));
    months.forEach((month) => monthFilter.add(new Option(month, month)));
  }

  if (yearFilter) {
    const years = [
      ...new Set(
        announcements.map((announcement) =>
          String(new Date(announcement.published_at).getFullYear()),
        ),
      ),
    ].sort((first, second) => Number(second) - Number(first));
    yearFilter.replaceChildren(new Option("All Years", "all"));
    years.forEach((year) => yearFilter.add(new Option(year, year)));
  }
}

function createAnnouncementCard(announcement, compact = false) {
  const category = getAnnouncementCategory(announcement);
  const card = document.createElement("article");
  card.className = compact ? "news-card" : "announcement-card";
  card.dataset.category = category.toLowerCase();
  card.dataset.month = new Date(announcement.published_at).toLocaleString(
    undefined,
    { month: "long" },
  );
  card.dataset.year = new Date(announcement.published_at).getFullYear();

  const tag = document.createElement("span");
  tag.className = `news-tag ${getCategoryClass(category)}`;
  tag.textContent = category;

  const date = document.createElement("span");
  date.className = "event-date";
  date.textContent = formatAnnouncementDate(announcement.published_at);

  if (announcement.featured_image_url) {
    const image = document.createElement("img");
    image.className = "announcement-featured-image";
    image.src = announcement.featured_image_url;
    image.alt = announcement.title || "Announcement image";
    image.loading = "lazy";
    card.append(image);
  }

  const title = document.createElement("h3");
  title.textContent = announcement.title || "Untitled announcement";

  const body = document.createElement("p");
  body.textContent = announcement.body || "";

  const action = document.createElement(compact ? "a" : "button");
  action.className = "read-more";
  action.textContent = compact ? "Read More ->" : "Read More ";
  if (!compact) {
    action.type = "button";
    action.append("->");
  } else {
    action.href = "#";
  }

  card.append(tag, date, title, body, action);
  return card;
}

function renderAnnouncements(announcements) {
  const fullGrid = document.querySelector("#announcementsGrid");
  const homeGrid = document.querySelector("#announcements .news-grid");

  if (fullGrid) {
    fullGrid.replaceChildren(
      ...announcements.map((announcement) =>
        createAnnouncementCard(announcement),
      ),
    );
    document.dispatchEvent(new CustomEvent("announcements:rendered"));
  }

  if (homeGrid) {
    homeGrid.replaceChildren(
      ...announcements
        .slice(0, 3)
        .map((announcement) => createAnnouncementCard(announcement, true)),
    );
  }
}

let activeAnnouncementTrigger = null;

function showAnnouncementModal(card, prefix) {
  const modalId = prefix ? `${prefix}AnnouncementModal` : "announcementModal";
  const modal = document.getElementById(modalId);
  if (!modal) return;
  const existingImage = modal.querySelector(".announcement-modal-image");
  existingImage?.remove();
  const cardImage = card.querySelector(".announcement-featured-image");
  if (cardImage) {
    const image = document.createElement("img");
    image.className = "announcement-modal-image";
    image.src = cardImage.src;
    image.alt = cardImage.alt;
    modal.querySelector("h2").before(image);
  }
  modal.querySelector(".news-tag").className =
    card.querySelector(".news-tag").className;
  modal.querySelector(".news-tag").textContent =
    card.querySelector(".news-tag").textContent;
  modal.querySelector(".event-date").textContent =
    card.querySelector(".event-date").textContent;
  modal.querySelector("h2").textContent = card.querySelector("h3").textContent;
  modal.querySelector("p").textContent = card.querySelector("p").textContent;
  modal.setAttribute("aria-hidden", "false");
  modal.classList.add("is-open");
  document.body.classList.add("announcement-modal-open");
}

function setupAnnouncementInteractions() {
  const fullGrid = document.querySelector("#announcementsGrid");
  const homeGrid = document.querySelector("#announcements .news-grid");
  const searchInput = document.getElementById("announcementSearch");
  const filters = [
    document.getElementById("filterCategory"),
    document.getElementById("filterMonth"),
    document.getElementById("filterYear"),
  ].filter(Boolean);
  const emptyState = document.getElementById("announcementsEmpty");

  function applyFilters() {
    if (!fullGrid) return;
    const query = searchInput?.value.trim().toLowerCase() || "";
    const category = document.getElementById("filterCategory")?.value || "all";
    const month = document.getElementById("filterMonth")?.value || "all";
    const year = document.getElementById("filterYear")?.value || "all";
    let visibleCount = 0;

    fullGrid.querySelectorAll(".announcement-card").forEach((card) => {
      const visible =
        (!query || card.textContent.toLowerCase().includes(query)) &&
        (category === "all" || card.dataset.category === category) &&
        (month === "all" || card.dataset.month === month) &&
        (year === "all" || card.dataset.year === year);
      card.hidden = !visible;
      if (visible) visibleCount += 1;
    });
    if (emptyState) emptyState.hidden = visibleCount !== 0;
  }

  [...filters, searchInput].filter(Boolean).forEach((control) => {
    control.addEventListener("input", applyFilters);
  });

  [fullGrid, homeGrid].filter(Boolean).forEach((grid) => {
    grid.addEventListener("click", (event) => {
      const action = event.target.closest(".read-more");
      if (!action) return;
      event.preventDefault();
      activeAnnouncementTrigger = action;
      showAnnouncementModal(
        action.closest("article"),
        grid === homeGrid ? "home" : "",
      );
    });
  });

  document.querySelectorAll(".announcement-modal").forEach((modal) => {
    modal
      .querySelector(".announcement-modal-close")
      ?.addEventListener("click", () => {
        activeAnnouncementTrigger?.focus();
        modal.setAttribute("aria-hidden", "true");
        modal.classList.remove("is-open");
        document.body.classList.remove("announcement-modal-open");
        activeAnnouncementTrigger = null;
      });
  });
}

async function loadAnnouncements() {
  try {
    const response = await fetch(announcementsApiUrl, {
      headers: { Accept: "application/json" },
    });
    if (!response.ok)
      throw new Error(`Announcements API returned HTTP ${response.status}`);
    const result = await response.json();
    const announcements = Array.isArray(result.data) ? result.data : [];
    populateAnnouncementFilters(announcements);
    renderAnnouncements(announcements);
  } catch (error) {
    console.error("Announcements API connection failed:", error);
  }
}

setupAnnouncementInteractions();
loadAnnouncements();
