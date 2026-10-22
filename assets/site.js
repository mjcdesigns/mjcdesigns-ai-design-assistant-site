const menuButton = document.querySelector('.menu-toggle');
const navigation = document.querySelector('#primary-nav');

menuButton?.addEventListener('click', () => {
  const expanded = menuButton.getAttribute('aria-expanded') === 'true';
  menuButton.setAttribute('aria-expanded', String(!expanded));
  menuButton.setAttribute('aria-label', expanded ? 'Open navigation' : 'Close navigation');
  navigation?.classList.toggle('is-open', !expanded);
});

navigation?.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => {
    menuButton?.setAttribute('aria-expanded', 'false');
    menuButton?.setAttribute('aria-label', 'Open navigation');
    navigation.classList.remove('is-open');
  });
});

const year = document.querySelector('#year');
if (year) year.textContent = new Date().getFullYear();

const screenshotDialog = document.querySelector('.screenshot-dialog');
const dialogImage = screenshotDialog?.querySelector('.dialog-image');
const dialogCaption = screenshotDialog?.querySelector('.dialog-caption');
const dialogCount = screenshotDialog?.querySelector('.dialog-count');
let activeGallery = null;
let activeIndex = 0;

const galleries = [...document.querySelectorAll('.screenshot-group')].map((group) => {
  const track = group.querySelector('.screenshot-track');
  const cards = [...track.querySelectorAll('.screenshot-card')];
  const previous = group.querySelector('.screenshot-prev');
  const next = group.querySelector('.screenshot-next');
  const position = group.querySelector('.screenshot-position');
  const gallery = { group, track, cards, previous, next, position, index: 0 };

  const scrollToCard = (index) => {
    const target = cards[Math.max(0, Math.min(cards.length - 1, index))];
    track.scrollTo({ left: target.offsetLeft - cards[0].offsetLeft, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
  };
  const updatePosition = () => {
    const left = track.scrollLeft;
    gallery.index = cards.reduce((best, card, index) =>
      Math.abs(card.offsetLeft - cards[0].offsetLeft - left) < Math.abs(cards[best].offsetLeft - cards[0].offsetLeft - left) ? index : best, 0);
    position.textContent = `${gallery.index + 1} / ${cards.length}`;
    previous.disabled = gallery.index === 0;
    next.disabled = gallery.index === cards.length - 1;
  };

  previous.addEventListener('click', () => scrollToCard(gallery.index - 1));
  next.addEventListener('click', () => scrollToCard(gallery.index + 1));
  track.addEventListener('scroll', () => window.requestAnimationFrame(updatePosition), { passive: true });
  cards.forEach((card, index) => {
    card.querySelector('.screenshot-open').addEventListener('click', () => {
      activeGallery = gallery;
      activeIndex = index;
      renderDialog();
      screenshotDialog.showModal();
    });
  });
  updatePosition();
  gallery.scrollToCard = scrollToCard;
  return gallery;
});

function renderDialog() {
  if (!activeGallery || !dialogImage) return;
  const card = activeGallery.cards[activeIndex];
  const image = card.querySelector('img');
  dialogImage.src = image.getAttribute('src');
  dialogImage.alt = image.alt;
  dialogCaption.textContent = card.querySelector('figcaption strong').textContent;
  dialogCount.textContent = `${activeGallery.group.querySelector('h3').textContent} · ${activeIndex + 1} / ${activeGallery.cards.length}`;
  activeGallery.scrollToCard(activeIndex);
}

function stepDialog(direction) {
  if (!activeGallery) return;
  activeIndex = (activeIndex + direction + activeGallery.cards.length) % activeGallery.cards.length;
  renderDialog();
}

screenshotDialog?.querySelector('.dialog-close').addEventListener('click', () => screenshotDialog.close());
screenshotDialog?.querySelector('.dialog-prev').addEventListener('click', () => stepDialog(-1));
screenshotDialog?.querySelector('.dialog-next').addEventListener('click', () => stepDialog(1));
screenshotDialog?.addEventListener('click', (event) => { if (event.target === screenshotDialog) screenshotDialog.close(); });
screenshotDialog?.addEventListener('keydown', (event) => {
  if (event.key === 'ArrowLeft') { event.preventDefault(); stepDialog(-1); }
  if (event.key === 'ArrowRight') { event.preventDefault(); stepDialog(1); }
});

document.querySelectorAll('.video-play').forEach((button) => {
  button.addEventListener('click', () => {
    const id = button.dataset.videoId;
    if (!/^[A-Za-z0-9_-]{11}$/.test(id)) return;
    const frame = document.createElement('iframe');
    frame.src = `https://www.youtube-nocookie.com/embed/${id}?autoplay=1`;
    frame.title = button.getAttribute('aria-label');
    frame.allow = 'accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture; web-share';
    frame.referrerPolicy = 'strict-origin-when-cross-origin';
    frame.allowFullscreen = true;
    frame.className = 'video-frame';
    button.replaceWith(frame);
    frame.focus();
  });
});
