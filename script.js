"use strict";

/* =========================
   CONFIG
========================= */
const API_URL = "https://portfolio-backend-hd55.onrender.com/api/contact";

/* =========================
   MOBILE MENU
========================= */
const menuBtn = document.getElementById("menu-btn");
const navMenu = document.getElementById("nav-menu");

if (menuBtn && navMenu) {
  menuBtn.addEventListener("click", () => {
    const expanded = menuBtn.getAttribute("aria-expanded") === "true";
    menuBtn.setAttribute("aria-expanded", !expanded);
    navMenu.classList.toggle("hidden");
  });

  document.querySelectorAll("#nav-menu a").forEach((link) => {
    link.addEventListener("click", () => {
      navMenu.classList.add("hidden");
      menuBtn.setAttribute("aria-expanded", false);
    });
  });
}

/* =========================
   RESUME MODAL
========================= */
const previewResumeBtn = document.getElementById("previewResumeBtn");

if (previewResumeBtn) {
  previewResumeBtn.addEventListener("click", () => {
    const modal = document.createElement("div");
    modal.className =
      "fixed inset-0 bg-black/80 flex items-center justify-center z-[9999]";

    modal.innerHTML = `
      <div class="bg-[#0b0f14] w-[90%] max-w-3xl h-[85%] rounded-xl border border-cyan-400/30 p-3 flex flex-col">
        <button id="closeModal" class="text-cyan-300 self-end mb-2">✖</button>
        <iframe src="resume.pdf" class="flex-1 w-full rounded-lg border border-white/10"></iframe>
      </div>
    `;

    document.body.appendChild(modal);

    document.getElementById("closeModal").onclick = () => modal.remove();

    modal.addEventListener("click", (e) => {
      if (e.target === modal) modal.remove();
    });
  });
}

/* =========================
   SCROLL REVEAL
========================= */
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("show");
      }
    });
  },
  { threshold: 0.1 }
);

document.querySelectorAll("section, .card").forEach((el) => {
  el.classList.add("reveal");
  observer.observe(el);
});

/* =========================
   NAV ACTIVE STATE
========================= */
const sections = document.querySelectorAll("section");
const navLinks = document.querySelectorAll("#nav-menu a");

window.addEventListener("scroll", () => {
  let current = "";

  sections.forEach((section) => {
    const top = window.scrollY;
    if (top >= section.offsetTop - 120) {
      current = section.getAttribute("id");
    }
  });

  navLinks.forEach((link) => {
    link.classList.remove("text-cyan-300");

    if (link.getAttribute("href") === "#" + current) {
      link.classList.add("text-cyan-300");
    }
  });
});

/* =========================
   CURSOR GLOW
========================= */
let lastMove = 0;

document.addEventListener("mousemove", (e) => {
  const now = Date.now();
  if (now - lastMove < 120) return;

  lastMove = now;

  const glow = document.createElement("div");
  glow.className = "cursor-glow";
  glow.style.left = e.clientX + "px";
  glow.style.top = e.clientY + "px";

  document.body.appendChild(glow);

  setTimeout(() => glow.remove(), 300);
});

/* =========================
   DEVICE CHECK
========================= */
const isLowEndDevice = navigator.hardwareConcurrency <= 4;

if (isLowEndDevice) {
  document.body.classList.add("low-performance");
}

/* =========================
   TOAST SYSTEM
========================= */
function showToast(message, type = "success") {
  const toast = document.getElementById("toast");
  const toastMessage = document.getElementById("toastMessage");

  if (!toast || !toastMessage) return;

  toastMessage.textContent = message;

  toast.classList.remove("hide", "success", "error");
  toast.classList.add(type);

  setTimeout(() => toast.classList.remove("hide"), 10);

  setTimeout(() => toast.classList.add("hide"), 3000);
}

/* =========================
   CONTACT FORM (FINAL FIXED VERSION)
========================= */
const contactForm = document.getElementById("contactForm");
const submitBtn = document.getElementById("submitBtn");

if (contactForm && submitBtn) {
  contactForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const message = document.getElementById("message").value.trim();

    if (!name || !email || !message) {
      showToast("Please fill all fields ⚠️", "error");
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = "Sending...";

    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ name, email, message })
      });

      const data = await res.json();

      if (data.success) {
        showToast("Message sent successfully 🚀", "success");
        contactForm.reset();
      } else {
        showToast(data.message || "Failed to send message ❌", "error");
      }
    } catch (err) {
      console.log(err);
      showToast("Server error ⚠️", "error");
    }

    submitBtn.disabled = false;
    submitBtn.textContent = "Send Message";
  });
}

/* =========================
   BOOT SCREEN
========================= */
window.addEventListener("load", () => {
  const boot = document.getElementById("bootScreen");

  setTimeout(() => {
    if (boot) {
      boot.style.opacity = "0";
      boot.style.transition = "0.6s ease";

      setTimeout(() => boot.remove(), 600);
    }
  }, 1500);
});

window.history.scrollRestoration = "manual";
window.addEventListener("load", () => {
  window.scrollTo(0, 0);
});