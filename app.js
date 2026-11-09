const navigation = document.getElementById('nav');
const mobileButton = document.getElementById('mobile');
const menuButtons = Array.from(navigation.querySelectorAll('.nav-group > button'));

function closeDropdowns() {
  menuButtons.forEach((button) => {
    button.setAttribute('aria-expanded', 'false');
    document.getElementById(button.getAttribute('aria-controls')).hidden = true;
  });
}

function closeMobileMenu() {
  mobileButton.setAttribute('aria-expanded', 'false');
  navigation.classList.remove('open');
  closeDropdowns();
}

menuButtons.forEach((button) => {
  button.addEventListener('click', () => {
    const shouldOpen = button.getAttribute('aria-expanded') !== 'true';
    closeDropdowns();
    button.setAttribute('aria-expanded', String(shouldOpen));
    document.getElementById(button.getAttribute('aria-controls')).hidden = !shouldOpen;
  });
});

mobileButton.addEventListener('click', () => {
  const shouldOpen = mobileButton.getAttribute('aria-expanded') !== 'true';
  closeDropdowns();
  mobileButton.setAttribute('aria-expanded', String(shouldOpen));
  navigation.classList.toggle('open', shouldOpen);
});

document.addEventListener('click', (event) => {
  if (!navigation.contains(event.target) && !mobileButton.contains(event.target)) {
    closeMobileMenu();
  }
});

document.addEventListener('keydown', (event) => {
  if (event.key !== 'Escape') return;
  const activeButton = menuButtons.find((button) => button.getAttribute('aria-expanded') === 'true');
  if (activeButton) {
    closeDropdowns();
    activeButton.focus();
  } else if (navigation.classList.contains('open')) {
    closeMobileMenu();
    mobileButton.focus();
  }
});

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

function initializeHero() {
  const hero = document.querySelector('.brand-hero');
  if (!hero) return;

  const track = hero.querySelector('.hero-track');
  const slides = Array.from(hero.querySelectorAll('.hero-slide'));
  const dots = Array.from(hero.querySelectorAll('[data-slide]'));
  const pauseButton = hero.querySelector('.hero-pause');
  let currentIndex = 0;
  let timer = null;
  let manuallyPaused = false;
  let pointerInside = false;
  let focusInside = false;
  let onScreen = true;

  function showSlide(index) {
    currentIndex = (index + slides.length) % slides.length;
    track.style.transform = `translateX(-${currentIndex * 100}%)`;
    slides.forEach((slide, slideIndex) => {
      const active = slideIndex === currentIndex;
      slide.classList.toggle('is-active', active);
      slide.setAttribute('aria-hidden', String(!active));
      slide.inert = !active;
    });
    dots.forEach((dot, dotIndex) => {
      dot.setAttribute('aria-current', String(dotIndex === currentIndex));
    });
  }

  function updateTimer() {
    window.clearInterval(timer);
    timer = null;
    if (manuallyPaused || pointerInside || focusInside || reducedMotion.matches || document.hidden || !onScreen) return;
    timer = window.setInterval(() => showSlide(currentIndex + 1), 5000);
  }

  function selectSlide(index) {
    showSlide(index);
    updateTimer();
  }

  hero.querySelector('.hero-prev').addEventListener('click', () => selectSlide(currentIndex - 1));
  hero.querySelector('.hero-next').addEventListener('click', () => selectSlide(currentIndex + 1));
  dots.forEach((dot) => {
    dot.addEventListener('click', () => selectSlide(Number(dot.dataset.slide)));
  });
  pauseButton.addEventListener('click', () => {
    manuallyPaused = !manuallyPaused;
    pauseButton.setAttribute('aria-pressed', String(manuallyPaused));
    pauseButton.setAttribute('aria-label', manuallyPaused ? '자동 전환 재생' : '자동 전환 일시정지');
    pauseButton.textContent = manuallyPaused ? '▷' : 'Ⅱ';
    updateTimer();
  });
  hero.addEventListener('pointerenter', (event) => {
    pointerInside = event.pointerType === 'mouse';
    updateTimer();
  });
  hero.addEventListener('pointerleave', () => {
    pointerInside = false;
    updateTimer();
  });
  hero.addEventListener('focusin', () => {
    focusInside = true;
    updateTimer();
  });
  hero.addEventListener('focusout', (event) => {
    focusInside = hero.contains(event.relatedTarget);
    updateTimer();
  });
  hero.querySelector('.hero-controls').addEventListener('keydown', (event) => {
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      selectSlide(currentIndex + 1);
    }
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      selectSlide(currentIndex - 1);
    }
  });
  document.addEventListener('visibilitychange', updateTimer);
  reducedMotion.addEventListener('change', updateTimer);
  if ('IntersectionObserver' in window) {
    const heroObserver = new IntersectionObserver(([entry]) => {
      onScreen = entry.isIntersecting;
      updateTimer();
    });
    heroObserver.observe(hero);
  }
  updateTimer();
}

function initializeProductCarousel() {
  const track = document.getElementById('product-track');
  if (!track) return;

  const previousButton = document.querySelector('.product-prev');
  const nextButton = document.querySelector('.product-next');
  const position = document.querySelector('.product-position');
  const cards = Array.from(track.children);

  function updateControls() {
    const step = cards[1].offsetLeft - cards[0].offsetLeft;
    const first = Math.min(cards.length, Math.round(track.scrollLeft / step) + 1);
    const gap = parseFloat(window.getComputedStyle(track).columnGap) || 0;
    const visibleCount = Math.max(1, Math.floor((track.clientWidth + gap + 1) / step));
    const last = Math.min(cards.length, first + visibleCount - 1);
    previousButton.disabled = track.scrollLeft < 2;
    nextButton.disabled = track.scrollLeft >= track.scrollWidth - track.clientWidth - 2;
    position.textContent = `${first}–${last} / ${cards.length} 제품군`;
  }

  function moveProducts(direction) {
    const step = cards[1].offsetLeft - cards[0].offsetLeft;
    const gap = parseFloat(window.getComputedStyle(track).columnGap) || 0;
    const visibleCount = Math.max(1, Math.floor((track.clientWidth + gap + 1) / step));
    track.scrollBy({
      left: direction * step * visibleCount,
      behavior: reducedMotion.matches ? 'instant' : 'smooth',
    });
  }

  previousButton.addEventListener('click', () => moveProducts(-1));
  nextButton.addEventListener('click', () => moveProducts(1));
  track.addEventListener('scroll', updateControls, { passive: true });
  if ('ResizeObserver' in window) {
    new ResizeObserver(updateControls).observe(track);
  } else {
    window.addEventListener('resize', updateControls);
  }
  updateControls();
}

function initializeScrollEffects() {
  if (reducedMotion.matches || !('IntersectionObserver' in window)) return;

  const targets = [
    ['.intro-picture', 'left'],
    ['.intro-copy', 'right'],
    ['.center-heading', 'down'],
    ['.showcase-card', 'up'],
    ['.corporate-pillars > a', 'up'],
    ['.brand-story-row, .brand-line, .history-highlights, .history-photos', 'up'],
    ['.field-copy', 'left'],
    ['.field-picture', 'right'],
    ['.promise-inner > div', 'up'],
    ['.section-title', 'up'],
    ['.news-card', 'up'],
    ['.channel', 'up'],
    ['.strip-inner > div', 'up'],
    ['.detail-article > .eyebrow, .detail-article > h2, .detail-article > .lead', 'up'],
    ['.detail-article .editorial, .article-section, .detail-products .item', 'up'],
  ];
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -25px 0px' });

  targets.forEach(([selector, direction]) => {
    document.querySelectorAll(selector).forEach((element, index) => {
      element.classList.add('reveal');
      element.dataset.direction = direction;
      element.style.setProperty('--reveal-delay', `${(index % 3) * 140}ms`);
      observer.observe(element);
    });
  });
  document.body.classList.add('motion-ready');
  document.addEventListener('focusin', (event) => {
    const element = event.target.closest('.reveal');
    if (element) element.classList.add('is-visible');
  });
}

initializeHero();
initializeProductCarousel();
initializeScrollEffects();

const siteHeader = document.querySelector('header');
window.addEventListener('scroll', () => {
  siteHeader.classList.toggle('is-scrolled', window.scrollY > 30);
}, { passive: true });
