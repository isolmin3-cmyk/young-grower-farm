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
