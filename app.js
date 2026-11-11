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
    ['.cultivation-card', 'up'],
    ['.brand-story-row, .brand-line', 'up'],
    ['.history-phase:nth-child(odd) > .phase-period, .history-phase:nth-child(odd) > h3', 'right'],
    ['.history-phase:nth-child(even) > .phase-period, .history-phase:nth-child(even) > h3', 'left'],
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


function initializeHistoryLineAnimations() {
  const lines = document.querySelectorAll('.history-phase li');
  if (!lines.length || reducedMotion.matches || !('IntersectionObserver' in window)) return;

  const lineObserver = new IntersectionObserver((entries) => {
    const enteringLines = entries.filter((entry) => entry.isIntersecting);
    enteringLines.forEach((entry, index) => {
      entry.target.style.setProperty('--line-delay', `${index * 110}ms`);
      entry.target.classList.add('is-line-visible');
      entry.target.closest('.history-phase').classList.add('is-visible');
      lineObserver.unobserve(entry.target);
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -30px 0px' });

  lines.forEach((line) => lineObserver.observe(line));
  document.body.classList.add('history-motion-ready');
}

initializeProductCarousel();
initializeScrollEffects();
initializeHistoryLineAnimations();

const siteHeader = document.querySelector('header');
window.addEventListener('scroll', () => {
  siteHeader.classList.toggle('is-scrolled', window.scrollY > 30);
}, { passive: true });

document.querySelectorAll('.product-photo-carousel').forEach((carousel) => {
  const track = carousel.querySelector('.product-photo-track');
  const controls = carousel.querySelector('.product-photo-controls');
  const buttons = [...controls.querySelectorAll('[data-photo-step]')];
  const slideCount = track.children.length;
  const currentSlide = () => Math.round(track.scrollLeft / track.clientWidth);

  function updateControls() {
    const index = currentSlide();
    buttons[0].disabled = index <= 0;
    buttons[1].disabled = index >= slideCount - 1;
  }

  buttons.forEach((button) => {
    button.addEventListener('click', () => {
      const next = currentSlide() + Number(button.dataset.photoStep);
      track.scrollTo({
        left: next * track.clientWidth,
        behavior: reducedMotion.matches ? 'auto' : 'smooth',
      });
    });
  });
  track.addEventListener('scroll', updateControls, { passive: true });
  updateControls();
  controls.hidden = false;
});
