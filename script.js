const WEDDING_DATE = "2026-06-14T15:00:00+03:00";
const RSVP_STORAGE_KEY = "wedding-rsvp-preview";
// Leave empty for demo mode, or set an email to open a prepared RSVP message.
const RSVP_EMAIL = "";

function pad(value) {
  return String(value).padStart(2, "0");
}

function updateCountdown() {
  const targetDate = new Date(WEDDING_DATE);
  const now = new Date();
  const diff = Math.max(targetDate.getTime() - now.getTime(), 0);

  const totalSeconds = Math.floor(diff / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const values = {
    days,
    hours,
    minutes,
    seconds,
  };

  document.querySelectorAll("[data-count]").forEach((node) => {
    const key = node.getAttribute("data-count");
    node.textContent = pad(values[key] ?? 0);
  });
}

function initReveal() {
  const items = document.querySelectorAll(".reveal");

  if (!("IntersectionObserver" in window)) {
    items.forEach((item) => item.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.15,
      rootMargin: "0px 0px -40px 0px",
    }
  );

  items.forEach((item) => observer.observe(item));
}

function buildRsvpPayload(form) {
  const formData = new FormData(form);
  const attendance = formData.get("attendance") || "";
  const guestName = formData.get("guestName") || "";
  const drinks = formData.getAll("drinks");
  const residence = formData.get("residence") || "";

  return {
    attendance,
    guestName,
    drinks,
    residence
  };
}

function formatRsvpMessage(payload) {
  const drinks = payload.drinks.length ? payload.drinks.join(", ") : "не указаны";

  return [
    "Подтверждение присутствия",
    "",
    `Имя: ${payload.guestName}`,
    `Присутствие: ${payload.attendance}`,
    `Напитки: ${drinks}`,
    `Проживание: ${payload.residence}`
  ].join("\n");
}

function initRsvpForm() {
  const form = document.getElementById("rsvp-form");
  const message = document.getElementById("rsvp-message");

  if (!form || !message) {
    return;
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    if (!form.reportValidity()) {
      return;
    }

    const payload = buildRsvpPayload(form);

    try {
      localStorage.setItem(RSVP_STORAGE_KEY, JSON.stringify(payload));
    } catch (error) {
      console.warn("Could not save RSVP locally:", error);
    }

    if (RSVP_EMAIL) {
      const subject = encodeURIComponent("Подтверждение присутствия на свадьбе");
      const body = encodeURIComponent(formatRsvpMessage(payload));
      window.location.href = `mailto:${RSVP_EMAIL}?subject=${subject}&body=${body}`;
    }

    message.hidden = false;
    message.textContent =
      RSVP_EMAIL
        ? "Спасибо! Открылось письмо с вашим ответом."
        : "Спасибо! Ответ сохранен в браузере. При желании можно подключить отправку на почту в script.js.";
    form.reset();
  });
}

document.addEventListener("DOMContentLoaded", () => {
  updateCountdown();
  window.setInterval(updateCountdown, 1000);
  initReveal();
  initRsvpForm();
});
