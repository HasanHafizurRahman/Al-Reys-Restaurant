const navToggle = document.getElementById('navToggle');
const mobileNav = document.getElementById('mobileNav');
navToggle?.addEventListener('click', () => {
    const isHidden = mobileNav.classList.toggle('hidden');
    navToggle.setAttribute('aria-expanded', String(!isHidden));
    document.getElementById('hamburger')?.classList.toggle('rotate-90');
});

// set active nav item based on location.hash (or default to #home)
(function setupNavActive() {
    const items = document.querySelectorAll('.nav-item');
    function setActive(hash) {
        items.forEach(i => i.classList.remove('active'));
        if (!hash) hash = '#home';
        const match = Array.from(items).find(a => a.dataset.target === hash);
        if (match) match.classList.add('active');
    }
    // initial
    setActive(location.hash || '#home');

    // change on hash change
    window.addEventListener('hashchange', () => setActive(location.hash));

    // allow clicking items to set active immediately (works when links don't change hash)
    items.forEach(a => a.addEventListener('click', (e) => {
        // small delay so URL hash change (if any) happens first
        setTimeout(() => setActive(location.hash || a.dataset.target), 30);
    }));
})();

// Reservation modal logic
const modalBackdrop = document.getElementById('modalBackdrop');
const openButtons = [document.getElementById('bookBtn'), document.getElementById('heroBook'), document.getElementById('mobileBookBtn')];
const closeModal = document.getElementById('closeModal');
const closeModalMobile = document.getElementById('closeModalMobile'); // new mobile close button
const cancelModal = document.getElementById('cancelModal');
const reserveForm = document.getElementById('reserveForm');

function openModal() {
    modalBackdrop.classList.remove('hidden');
    modalBackdrop.classList.add('flex');
    document.body.style.overflow = 'hidden';
    // focus first input for accessibility
    setTimeout(() => modalBackdrop.querySelector('input[name="fullname"]')?.focus(), 80);
}

function hideModal() {
    modalBackdrop.classList.remove('flex');
    modalBackdrop.classList.add('hidden');
    document.body.style.overflow = '';
}

openButtons.forEach(btn => { if (btn) btn.addEventListener('click', openModal); });
closeModal?.addEventListener('click', hideModal);
closeModalMobile?.addEventListener('click', hideModal); // hook mobile close to same handler
cancelModal?.addEventListener('click', hideModal);
modalBackdrop?.addEventListener('click', (e) => { if (e.target === modalBackdrop) hideModal(); });

reserveForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    // This is a demo handler. Connect to backend / API as needed.
    alert('Reservation requested! We will contact you soon to confirm.');
    hideModal();
    reserveForm.reset();
});

// Testimonial slider (improved: dynamic avatar, dots, keyboard support, pause on hover)
(function () {
    const slider = document.getElementById('testimonialSlider');
    const slides = Array.from(slider.querySelectorAll('.slide'));
    const prevBtn = document.getElementById('prevTesti');
    const nextBtn = document.getElementById('nextTesti');
    const avatarImg = document.getElementById('dynamicAvatar');
    const dotsContainer = document.getElementById('testiDots');
    const liveRegion = document.getElementById('testiLive');

    let idx = 0;
    let timer = null;
    const interval = 6000;
    let paused = false;

    function show(i, fromUser = false) {
        if (i < 0) i = slides.length - 1;
        if (i >= slides.length) i = 0;
        idx = i;
        slides.forEach((s, j) => {
            s.classList.toggle('active', j === i);
            const tab = dotsContainer.children[j];
            if (tab) {
                tab.classList.toggle('active', j === i);
                tab.setAttribute('aria-selected', String(j === i));
                tab.setAttribute('tabindex', j === i ? '0' : '-1');
            }
        });

        // Update avatar from data-avatar attr
        const avatar = slides[i].dataset.avatar || '/assets/avatar1.jpg';
        const author = slides[i].dataset.author || '';
        avatarImg.src = avatar;
        avatarImg.alt = author ? `Avatar of ${author}` : 'Customer avatar';

        // Announce for screen readers
        const text = slides[i].querySelector('p')?.textContent?.trim() || '';
        liveRegion.textContent = `Testimonial ${i + 1} of ${slides.length}. ${author}. ${text}`;

        // If this change was user-initiated, reset auto-rotate
        if (fromUser) resetAuto();
    }

    function next(fromUser = false) { show((idx + 1) % slides.length, fromUser); }
    function prev(fromUser = false) { show((idx - 1 + slides.length) % slides.length, fromUser); }

    // create dots
    slides.forEach((_, i) => {
        const dot = document.createElement('button');
        dot.className = 'testi-dot nav-focus';
        dot.setAttribute('role', 'tab');
        dot.setAttribute('aria-label', `Show testimonial ${i + 1}`);
        dot.setAttribute('aria-selected', 'false');
        dot.setAttribute('tabindex', '-1');
        dot.addEventListener('click', () => show(i, true));
        dot.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                show(i, true);
            }
        });
        dotsContainer.appendChild(dot);
    });

    function startAuto() { timer = setInterval(() => { if (!paused) next(); }, interval); }
    function resetAuto() { clearInterval(timer); startAuto(); }

    // pause on hover / focus for accessibility
    slider.addEventListener('mouseenter', () => paused = true);
    slider.addEventListener('mouseleave', () => paused = false);
    slider.addEventListener('focusin', () => paused = true);
    slider.addEventListener('focusout', () => paused = false);

    nextBtn?.addEventListener('click', () => next(true));
    prevBtn?.addEventListener('click', () => prev(true));

    // keyboard support (left/right)
    document.addEventListener('keydown', (e) => {
        // allow arrows only when focus is inside testimonial region OR if user explicitly wants keyboard control
        const activeEl = document.activeElement;
        const testiRegion = document.getElementById('testimonials');
        const insideTesti = testiRegion && (testiRegion.contains(activeEl) || activeEl === document.body);
        if (e.key === 'ArrowRight') { next(true); }
        if (e.key === 'ArrowLeft') { prev(true); }
    });

    // make slides focusable for screen readers / keyboard
    slides.forEach(s => s.setAttribute('tabindex', '0'));

    if (slides.length > 0) {
        show(0);
        startAuto();
    }
})();

// Tiny enhancement: smooth scroll for internal links
document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', (e) => {
        const href = a.getAttribute('href');
        if (href && href.startsWith('#')) {
            e.preventDefault();
            const el = document.querySelector(href);
            if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    });
});

// Stats strip — count-up + reveal when visible
(function () {
  const statSection = document.getElementById('highlights-stats');
  if (!statSection) return;

  const statEls = Array.from(statSection.querySelectorAll('.stat-number'));
  const duration = 1400; // ms

  function animateCount(el, target) {
    const start = 0;
    const end = Number(target);
    if (isNaN(end)) return;
    const startTime = performance.now();

    function step(now) {
      const t = Math.min((now - startTime) / duration, 1);
      // easeOutCubic
      const eased = 1 - Math.pow(1 - t, 3);
      const current = Math.floor(start + (end - start) * eased);
      el.textContent = String(current);
      if (t < 1) requestAnimationFrame(step);
      else el.textContent = String(end);
    }
    requestAnimationFrame(step);
  }

  const obs = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        statSection.querySelectorAll('.stat-card').forEach(c => c.classList.add('revealed'));
        statEls.forEach(el => {
          const target = el.dataset.target || el.textContent || '0';
          animateCount(el, target);
        });
        observer.disconnect(); // run once
      }
    });
  }, { threshold: 0.25 });

  obs.observe(statSection);
})();
