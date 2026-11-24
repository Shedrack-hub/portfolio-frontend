"use strict";

/* =========================
   CONFIG
========================= */
const EMAILJS_SERVICE_ID = "service_ikdpkmr";
const EMAILJS_TEMPLATE_ID = "template_ayrojd7";
const EMAILJS_PUBLIC_KEY = "oGV5x_w9qS6FrLjZT";

/* =========================
   MOBILE MENU
========================= */
const menuBtn = document.getElementById("menu-btn");
const navMenu = document.getElementById("nav-menu");

if (menuBtn && navMenu) {
  function setMobileMenuOpen(open) {
    menuBtn.setAttribute("aria-expanded", String(open));
    menuBtn.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    menuBtn.textContent = open ? "×" : "☰";
    navMenu.classList.toggle("hidden", !open);
    navMenu.classList.toggle("mobile-open", open);
  }

  menuBtn.addEventListener("click", () => {
    const expanded = menuBtn.getAttribute("aria-expanded") === "true";
    setMobileMenuOpen(!expanded);
  });

  document.querySelectorAll("#nav-menu a").forEach((link) => {
    link.addEventListener("click", () => {
      setMobileMenuOpen(false);
    });
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && menuBtn.getAttribute("aria-expanded") === "true") {
      setMobileMenuOpen(false);
      menuBtn.focus();
    }
  });

  document.addEventListener("pointerdown", (event) => {
    if (
      menuBtn.getAttribute("aria-expanded") === "true" &&
      !navMenu.contains(event.target) &&
      !menuBtn.contains(event.target)
    ) {
      setMobileMenuOpen(false);
    }
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth >= 768 && menuBtn.getAttribute("aria-expanded") === "true") {
      setMobileMenuOpen(false);
    }
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
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("show");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12 }
);

document.querySelectorAll("main, section, footer, .card, section .rounded-2xl").forEach((el) => {
  el.classList.add("reveal");
  revealObserver.observe(el);
});

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const supportsHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

/* =========================
   CONTROLLED SCROLLING
========================= */
const WHEEL_SCROLL_FACTOR = 0.7;
const SCROLL_DURATION_PER_PIXEL = 0.65;
const MIN_SCROLL_DURATION = 900;
const MAX_SCROLL_DURATION = 2100;
let scrollAnimationFrame = 0;
let previousScrollBehavior = null;

function cancelScrollAnimation() {
  if (scrollAnimationFrame) {
    window.cancelAnimationFrame(scrollAnimationFrame);
    scrollAnimationFrame = 0;
  }

  if (previousScrollBehavior !== null) {
    document.documentElement.style.scrollBehavior = previousScrollBehavior;
    previousScrollBehavior = null;
  }
}

function scrollToPosition(destination, anchorTarget = null, headerHeight = 0) {
  cancelScrollAnimation();
  const getDestination = () => {
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    const currentDestination = anchorTarget
      ? getAnchorDestination(anchorTarget, headerHeight)
      : destination;
    return Math.max(0, Math.min(currentDestination, maxScroll));
  };
  const target = getDestination();

  if (prefersReducedMotion || Math.abs(target - window.scrollY) < 1) {
    window.scrollTo({ top: target, behavior: "instant" });
    return;
  }

  const start = window.scrollY;
  const distance = target - start;
  const duration = Math.max(
    MIN_SCROLL_DURATION,
    Math.min(MAX_SCROLL_DURATION, Math.abs(distance) * SCROLL_DURATION_PER_PIXEL)
  );
  const startTime = performance.now();
  previousScrollBehavior = document.documentElement.style.scrollBehavior;
  document.documentElement.style.scrollBehavior = "auto";

  function animate(timestamp) {
    const progress = Math.min((timestamp - startTime) / duration, 1);
    const easedProgress =
      progress < 0.5
        ? 4 * progress ** 3
        : 1 - ((-2 * progress + 2) ** 3) / 2;

    const currentTarget = getDestination();
    window.scrollTo(0, start + (currentTarget - start) * easedProgress);

    if (progress < 1) {
      scrollAnimationFrame = window.requestAnimationFrame(animate);
      return;
    }

    scrollAnimationFrame = 0;
    document.documentElement.style.scrollBehavior = previousScrollBehavior;
    previousScrollBehavior = null;
  }

  scrollAnimationFrame = window.requestAnimationFrame(animate);
}

function getAnchorDestination(target, headerHeight) {
  const translate = getComputedStyle(target).translate;
  const translateY = translate === "none" ? 0 : parseFloat(translate.split(" ")[1]) || 0;
  return target.getBoundingClientRect().top + window.scrollY - translateY - headerHeight - 12;
}

function scrollToAnchor(target) {
  const headerHeight = document.querySelector("header")?.getBoundingClientRect().height || 0;
  scrollToPosition(getAnchorDestination(target, headerHeight), target, headerHeight);
}

document.addEventListener("click", (event) => {
  if (
    event.defaultPrevented ||
    event.button !== 0 ||
    event.metaKey ||
    event.ctrlKey ||
    event.shiftKey ||
    event.altKey
  ) {
    return;
  }

  const link = event.target instanceof Element ? event.target.closest('a[href^="#"]') : null;
  if (!link || (link.target && link.target !== "_self")) return;

  const hash = link.getAttribute("href");
  const target = document.getElementById(hash.slice(1));
  if (!target) return;

  event.preventDefault();
  if (window.location.hash !== hash) {
    window.history.pushState(null, "", hash);
  }
  scrollToAnchor(target);
});

window.addEventListener("popstate", () => {
  const target = document.getElementById(window.location.hash.slice(1));
  if (target) {
    scrollToAnchor(target);
    return;
  }
  scrollToPosition(0);
});

window.addEventListener("wheel", (event) => {
  if (
    !event.cancelable ||
    event.defaultPrevented ||
    event.ctrlKey ||
    event.metaKey ||
    event.shiftKey ||
    event.altKey ||
    event.deltaX !== 0 ||
    event.deltaY === 0
  ) {
    return;
  }

  const eventTarget = event.target instanceof Element ? event.target : null;
  if (eventTarget?.closest("input, textarea, select, [contenteditable]:not([contenteditable='false']), [role='textbox']")) {
    return;
  }

  let scrollable = eventTarget;
  while (scrollable && scrollable !== document.body) {
    const overflowY = getComputedStyle(scrollable).overflowY;
    if (
      (overflowY === "auto" || overflowY === "scroll") &&
      scrollable.scrollHeight > scrollable.clientHeight
    ) {
      const canScrollUp = event.deltaY < 0 && scrollable.scrollTop > 0;
      const canScrollDown =
        event.deltaY > 0 &&
        scrollable.scrollTop + scrollable.clientHeight < scrollable.scrollHeight - 1;
      if (canScrollUp || canScrollDown) return;
    }
    scrollable = scrollable.parentElement;
  }

  const lineHeight = parseFloat(getComputedStyle(document.documentElement).lineHeight) || 16;
  const delta =
    event.deltaY *
    (event.deltaMode === WheelEvent.DOM_DELTA_LINE
      ? lineHeight
      : event.deltaMode === WheelEvent.DOM_DELTA_PAGE
        ? window.innerHeight
        : 1);
  const maxScroll = document.documentElement.scrollHeight - window.innerHeight;

  if ((delta < 0 && window.scrollY <= 0) || (delta > 0 && window.scrollY >= maxScroll)) {
    return;
  }

  event.preventDefault();
  cancelScrollAnimation();
  window.scrollBy({ top: delta * WHEEL_SCROLL_FACTOR, behavior: "instant" });
}, { passive: false });

/* =========================
   INTERACTIVE NETWORK GLOBE
========================= */
const globeCanvas = document.getElementById("globeCanvas");

if (globeCanvas instanceof HTMLCanvasElement) {
  const context = globeCanvas.getContext("2d");
  const nodes = [];
  const edges = [];
  const latitudeSteps = 8;
  const longitudeSteps = 18;
  let globeRadius = 0;
  let rotationX = -0.14;
  let rotationY = 0.2;
  let dragPoint = null;
  let globeVisible = false;
  let animationFrame = 0;
  let lastFrameTime = 0;

  for (let latitudeIndex = 0; latitudeIndex <= latitudeSteps; latitudeIndex += 1) {
    const latitude = ((latitudeIndex / latitudeSteps) * 160 - 80) * (Math.PI / 180);

    for (let longitudeIndex = 0; longitudeIndex < longitudeSteps; longitudeIndex += 1) {
      const longitude = (longitudeIndex / longitudeSteps) * Math.PI * 2;
      const latitudeRadius = Math.cos(latitude);
      nodes.push({
        x: latitudeRadius * Math.cos(longitude),
        y: Math.sin(latitude),
        z: latitudeRadius * Math.sin(longitude)
      });
    }
  }

  nodes.forEach((node, startIndex) => {
    for (let endIndex = startIndex + 1; endIndex < nodes.length; endIndex += 1) {
      const other = nodes[endIndex];
      const distanceSquared =
        (node.x - other.x) ** 2 +
        (node.y - other.y) ** 2 +
        (node.z - other.z) ** 2;

      if (distanceSquared < 0.14) {
        edges.push([startIndex, endIndex]);
      }
    }
  });

  function projectGlobePoint(point, centerX, centerY) {
    const rotatedX = point.x * Math.cos(rotationY) - point.z * Math.sin(rotationY);
    const rotatedZ = point.x * Math.sin(rotationY) + point.z * Math.cos(rotationY);
    const rotatedY = point.y * Math.cos(rotationX) - rotatedZ * Math.sin(rotationX);
    const depth = point.y * Math.sin(rotationX) + rotatedZ * Math.cos(rotationX);

    return {
      x: centerX + rotatedX * globeRadius,
      y: centerY - rotatedY * globeRadius,
      depth
    };
  }

  function drawGlobe() {
    if (!context || !globeCanvas.width || !globeCanvas.height) return;

    const bounds = globeCanvas.getBoundingClientRect();
    const centerX = bounds.width / 2;
    const centerY = bounds.height / 2;
    const projectedNodes = nodes.map((node) => projectGlobePoint(node, centerX, centerY));

    context.clearRect(0, 0, bounds.width, bounds.height);
    context.save();

    const sphereGlow = context.createRadialGradient(
      centerX - globeRadius * 0.28,
      centerY - globeRadius * 0.34,
      globeRadius * 0.06,
      centerX,
      centerY,
      globeRadius * 1.15
    );
    sphereGlow.addColorStop(0, "rgba(10, 87, 115, 0.38)");
    sphereGlow.addColorStop(0.7, "rgba(4, 25, 45, 0.7)");
    sphereGlow.addColorStop(1, "rgba(3, 10, 23, 0.92)");
    context.beginPath();
    context.arc(centerX, centerY, globeRadius, 0, Math.PI * 2);
    context.fillStyle = sphereGlow;
    context.fill();
    context.strokeStyle = "rgba(77, 238, 255, 0.72)";
    context.lineWidth = 1.25;
    context.shadowColor = "rgba(0, 229, 255, 0.7)";
    context.shadowBlur = 20;
    context.stroke();
    context.shadowBlur = 0;

    function drawCurve(curvePoints) {
      context.beginPath();
      curvePoints.forEach((point, index) => {
        if (index === 0) context.moveTo(point.x, point.y);
        else context.lineTo(point.x, point.y);
      });
      context.closePath();
      context.strokeStyle = "rgba(56, 211, 255, 0.16)";
      context.lineWidth = 0.7;
      context.stroke();
    }

    for (let latitudeIndex = 1; latitudeIndex < latitudeSteps; latitudeIndex += 1) {
      const latitude = ((latitudeIndex / latitudeSteps) * 160 - 80) * (Math.PI / 180);
      const ring = [];

      for (let segment = 0; segment < 48; segment += 1) {
        const longitude = (segment / 48) * Math.PI * 2;
        const latitudeRadius = Math.cos(latitude);
        ring.push(projectGlobePoint({
          x: latitudeRadius * Math.cos(longitude),
          y: Math.sin(latitude),
          z: latitudeRadius * Math.sin(longitude)
        }, centerX, centerY));
      }

      drawCurve(ring);
    }

    for (let longitudeIndex = 0; longitudeIndex < 12; longitudeIndex += 1) {
      const longitude = (longitudeIndex / 12) * Math.PI * 2;
      const meridian = [];

      for (let segment = 0; segment <= 40; segment += 1) {
        const latitude = ((segment / 40) * 160 - 80) * (Math.PI / 180);
        const latitudeRadius = Math.cos(latitude);
        meridian.push(projectGlobePoint({
          x: latitudeRadius * Math.cos(longitude),
          y: Math.sin(latitude),
          z: latitudeRadius * Math.sin(longitude)
        }, centerX, centerY));
      }

      drawCurve(meridian);
    }

    context.beginPath();
    edges.forEach(([start, end]) => {
      const first = projectedNodes[start];
      const second = projectedNodes[end];

      if ((first.depth + second.depth) / 2 > -0.08) {
        context.moveTo(first.x, first.y);
        context.lineTo(second.x, second.y);
      }
    });
    context.strokeStyle = "rgba(70, 231, 255, 0.28)";
    context.lineWidth = 0.65;
    context.stroke();

    projectedNodes.forEach((point, index) => {
      if (point.depth < -0.05) return;

      const opacity = 0.28 + point.depth * 0.66;
      const radius = index % 9 === 0 ? 2 : 1.2;
      context.beginPath();
      context.arc(point.x, point.y, radius, 0, Math.PI * 2);
      context.fillStyle = `rgba(130, 248, 255, ${opacity})`;
      context.shadowColor = "rgba(0, 229, 255, 0.8)";
      context.shadowBlur = index % 9 === 0 ? 9 : 3;
      context.fill();
    });

    context.restore();
  }

  function resizeGlobe() {
    const bounds = globeCanvas.getBoundingClientRect();
    if (!bounds.width || !bounds.height) return;

    const pixelRatio = Math.min(window.devicePixelRatio || 1, 1.5);
    globeCanvas.width = Math.round(bounds.width * pixelRatio);
    globeCanvas.height = Math.round(bounds.height * pixelRatio);
    context?.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    globeRadius = Math.min(bounds.width, bounds.height) * 0.37;
    drawGlobe();
  }

  function animateGlobe(timestamp) {
    if (!globeVisible || document.hidden || prefersReducedMotion) {
      animationFrame = 0;
      return;
    }

    if (timestamp - lastFrameTime >= 1000 / 30) {
      if (!dragPoint) rotationY += 0.0025;
      drawGlobe();
      lastFrameTime = timestamp;
    }

    animationFrame = window.requestAnimationFrame(animateGlobe);
  }

  const globeObserver = new IntersectionObserver(([entry]) => {
    globeVisible = entry.isIntersecting;

    if (globeVisible) {
      drawGlobe();
      if (!prefersReducedMotion && !animationFrame) {
        animationFrame = window.requestAnimationFrame(animateGlobe);
      }
    } else if (animationFrame) {
      window.cancelAnimationFrame(animationFrame);
      animationFrame = 0;
    }
  }, { rootMargin: "100px" });

  globeObserver.observe(globeCanvas);
  resizeGlobe();
  window.addEventListener("resize", resizeGlobe);
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden && globeVisible && !prefersReducedMotion && !animationFrame) {
      animationFrame = window.requestAnimationFrame(animateGlobe);
    }
  });

  globeCanvas.addEventListener("pointerdown", (event) => {
    if (event.button !== 0) return;
    dragPoint = { x: event.clientX, y: event.clientY };
    globeCanvas.classList.add("is-dragging");
    globeCanvas.setPointerCapture(event.pointerId);
  });

  globeCanvas.addEventListener("pointermove", (event) => {
    if (!dragPoint) return;

    rotationY += (event.clientX - dragPoint.x) * 0.008;
    rotationX = Math.max(-1.15, Math.min(1.15, rotationX + (event.clientY - dragPoint.y) * 0.008));
    dragPoint = { x: event.clientX, y: event.clientY };
    drawGlobe();
  });

  function releaseGlobePointer() {
    dragPoint = null;
    globeCanvas.classList.remove("is-dragging");
  }

  globeCanvas.addEventListener("pointerup", releaseGlobePointer);
  globeCanvas.addEventListener("pointercancel", releaseGlobePointer);
  globeCanvas.addEventListener("lostpointercapture", releaseGlobePointer);
  globeCanvas.addEventListener("keydown", (event) => {
    const keyRotations = {
      ArrowLeft: [-0.12, 0],
      ArrowRight: [0.12, 0],
      ArrowUp: [0, -0.12],
      ArrowDown: [0, 0.12]
    };
    const rotation = keyRotations[event.key];

    if (!rotation) return;
    event.preventDefault();
    rotationY += rotation[0];
    rotationX = Math.max(-1.15, Math.min(1.15, rotationX + rotation[1]));
    drawGlobe();
  });
}

if (!prefersReducedMotion && supportsHover) {
  document.querySelectorAll("section .rounded-2xl").forEach((card) => {
    card.classList.add("tilt-card");

    card.addEventListener("pointermove", (event) => {
      const bounds = card.getBoundingClientRect();
      const x = (event.clientX - bounds.left) / bounds.width - 0.5;
      const y = (event.clientY - bounds.top) / bounds.height - 0.5;

      card.style.setProperty("--tilt-x", `${(x * 12).toFixed(2)}deg`);
      card.style.setProperty("--tilt-y", `${(y * -12).toFixed(2)}deg`);
      card.style.setProperty("--pointer-x", `${((x + 0.5) * 100).toFixed(1)}%`);
      card.style.setProperty("--pointer-y", `${((y + 0.5) * 100).toFixed(1)}%`);
    });

    card.addEventListener("pointerleave", () => {
      card.style.setProperty("--tilt-x", "0deg");
      card.style.setProperty("--tilt-y", "0deg");
      card.style.setProperty("--pointer-x", "50%");
      card.style.setProperty("--pointer-y", "50%");
    });
  });
}

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

    if (contactForm.elements.company.value) {
      showToast("Unable to send message.", "error");
      return;
    }

    if (!window.emailjs) {
      showToast("Contact service unavailable. Please email directly.", "error");
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = "Sending...";

    try {
      await window.emailjs.sendForm(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        contactForm,
        { publicKey: EMAILJS_PUBLIC_KEY }
      );
      showToast("Message sent successfully 🚀", "success");
      contactForm.reset();
    } catch (err) {
      console.error("EmailJS contact submission failed:", err);
      showToast("Could not send message. Please try again or email directly.", "error");
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = "Send Message";
    }
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
  window.scrollTo({ top: 0, behavior: "instant" });
});