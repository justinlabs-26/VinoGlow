/* Vino Glow — small interactions only.
   No frameworks; no commerce; just polish. */

(() => {
  // -----------------------------
  // Year in footer
  // -----------------------------
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // -----------------------------
  // Header shadow on scroll
  // -----------------------------
  const header = document.getElementById("site-header");
  const onScroll = () => {
    if (!header) return;
    header.classList.toggle("is-scrolled", window.scrollY > 8);
  };
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  // -----------------------------
  // Reveal on scroll (IntersectionObserver)
  // -----------------------------
  const reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && reveals.length) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    reveals.forEach((el) => io.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add("is-visible"));
  }

  // -----------------------------
  // Quantity stepper
  // -----------------------------
  const qtyInput = document.getElementById("qty");
  document.querySelectorAll("[data-qty]").forEach((btn) => {
    btn.addEventListener("click", () => {
      if (!qtyInput) return;
      const dir = btn.dataset.qty === "+" ? 1 : -1;
      const next = Math.max(1, Math.min(9, parseInt(qtyInput.value, 10) || 1) + dir);
      qtyInput.value = next;
    });
  });
  if (qtyInput) {
    qtyInput.addEventListener("input", () => {
      const cleaned = qtyInput.value.replace(/[^0-9]/g, "");
      qtyInput.value = cleaned ? Math.max(1, Math.min(9, parseInt(cleaned, 10))) : "";
    });
    qtyInput.addEventListener("blur", () => {
      if (!qtyInput.value) qtyInput.value = "1";
    });
  }

  // -----------------------------
  // Add to cart (visual only)
  // -----------------------------
  const cartBtn = document.querySelector(".icon-btn");
  const cartCountEl = document.querySelector(".cart-count");
  const toast = document.getElementById("cart-toast");
  let cartCount = 0;
  let toastTimer;

  document.querySelectorAll("[data-cart-button]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const qty = parseInt(qtyInput?.value, 10) || 1;
      cartCount += qty;
      if (cartCountEl) cartCountEl.textContent = String(cartCount);
      if (cartBtn) {
        cartBtn.classList.add("bump");
        setTimeout(() => cartBtn.classList.remove("bump"), 320);
      }

      if (toast) {
        toast.classList.add("is-visible");
        clearTimeout(toastTimer);
        toastTimer = setTimeout(() => toast.classList.remove("is-visible"), 1800);
      }
    });
  });

  // -----------------------------
  // Contact form — submit via fetch so the user stays on the page
  // and sees an inline confirmation (works with Formspree's JSON endpoint).
  // -----------------------------
  const contactForm = document.querySelector(".contact-form");
  if (contactForm) {
    contactForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const status = contactForm.querySelector(".form-status");
      const submitBtn = contactForm.querySelector('button[type="submit"]');
      const btnSpan = submitBtn?.querySelector("span");
      const originalText = btnSpan?.textContent;

      // Basic native validation (we set novalidate so we can style our own)
      if (!contactForm.checkValidity()) {
        if (status) {
          status.textContent = "Please fill in the required fields.";
          status.className = "form-status is-error";
        }
        return;
      }

      submitBtn.disabled = true;
      if (btnSpan) btnSpan.textContent = "Sending…";
      if (status) {
        status.textContent = "";
        status.className = "form-status";
      }

      try {
        const res = await fetch(contactForm.action, {
          method: "POST",
          body: new FormData(contactForm),
          headers: { Accept: "application/json" },
        });
        if (res.ok) {
          contactForm.reset();
          if (status) {
            status.textContent = "Thank you — your message has been received.";
            status.className = "form-status is-success";
          }
        } else {
          const data = await res.json().catch(() => ({}));
          const msg =
            data?.errors?.map((e) => e.message).join(", ") ||
            "Something went wrong. Please try again.";
          throw new Error(msg);
        }
      } catch (err) {
        if (status) {
          status.textContent = err.message || "Something went wrong. Please try again.";
          status.className = "form-status is-error";
        }
      } finally {
        submitBtn.disabled = false;
        if (btnSpan && originalText) btnSpan.textContent = originalText;
      }
    });
  }

  // -----------------------------
  // Smooth in-page anchors w/ header offset
  // -----------------------------
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener("click", (e) => {
      const id = a.getAttribute("href");
      if (!id || id === "#") return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      const headerH = header ? header.offsetHeight : 0;
      const top = target.getBoundingClientRect().top + window.scrollY - headerH - 8;
      window.scrollTo({ top, behavior: "smooth" });
    });
  });
})();
