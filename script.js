const menuBtn = document.querySelector('.menu-btn');
const navLinks = document.querySelector('.nav-links');
const navbar = document.querySelector('.navbar');
let lastScrollY = window.scrollY; // Store the previous vertical scroll position

// Function to handle the smart navbar behavior
function handleNavbarScroll() {
    const currentScrollY = window.scrollY; // Current scroll position

    if (currentScrollY > lastScrollY && currentScrollY > 50) { 
        // User is scrolling DOWN - hide the navbar
        navbar.classList.add('navbar-hidden');
    } 
    else if (currentScrollY < lastScrollY || currentScrollY < 50) { 
        // User is scrolling UP or is near the top - show the navbar
        navbar.classList.remove('navbar-hidden');
    }
    lastScrollY = currentScrollY; // Update the last known scroll position
}

// Add the scroll event listener to the window
// Note: We use passive: true for performance
window.addEventListener('scroll', handleNavbarScroll, { passive: true });

// Note: Ensure your existing menu button script is below this or inside an initialization block
// to keep your code clean.

// Check if the elements were found before trying to add an event listener
if (menuBtn && navLinks) {
    menuBtn.addEventListener('click', () => {
        // 1. Toggle the 'active' class on the navigation links
        navLinks.classList.toggle('active');

        // 2. Change the menu button icon
        menuBtn.innerHTML = navLinks.classList.contains('active') 
            ? '<i class="fas fa-times"></i>'  // X icon when open
            : '<i class="fas fa-bars"></i>'; // Hamburger icon when closed
    });
}

/* Theme toggle button*/
const toggleBtn = document.getElementById('theme-toggle');
const root = document.documentElement;

if (toggleBtn) {
  // 1️⃣ Load saved theme or system preference
  const savedTheme = localStorage.getItem('theme');
  const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const currentTheme = savedTheme || (systemPrefersDark ? 'dark' : 'light');

  root.setAttribute('data-theme', currentTheme);
  toggleBtn.innerHTML = currentTheme === 'dark'
    ? '<i class="fas fa-sun"></i>'
    : '<i class="fas fa-moon"></i>';

  // 2️⃣ Toggle theme on click
  toggleBtn.addEventListener('click', () => {
    const newTheme = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    toggleBtn.innerHTML = newTheme === 'dark'
      ? '<i class="fas fa-sun"></i>'
      : '<i class="fas fa-moon"></i>';
  });
}


/* Alert of all rights reserved when right click on images */
document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll("img").forEach((img) => {
    img.addEventListener("contextmenu", (event) => {
      event.preventDefault();
      alert("© All rights reserved. Contact for licensing.");
    });
  });
});

// === Multiple Independent Carousels ===
document.querySelectorAll('.carousel-container').forEach((carousel) => {
  const track = carousel.querySelector('.carousel-track');
  const items = carousel.querySelectorAll('.carousel-item');
  const nextBtn = carousel.querySelector('.carousel-btn.next');
  const prevBtn = carousel.querySelector('.carousel-btn.prev');

  let index = 0;

  function updateCarousel() {
    const itemWidth = items[0].getBoundingClientRect().width;
    track.style.transform = `translateX(-${index * itemWidth}px)`;
  }

  nextBtn.addEventListener('click', () => {
    if (index < items.length - 1) {
      index++;
      updateCarousel();
    }
  });

  prevBtn.addEventListener('click', () => {
    if (index > 0) {
      index--;
      updateCarousel();
    }
  });

  window.addEventListener('resize', updateCarousel);

  // Optional: swipe for mobile
  let startX = 0;
  track.addEventListener('touchstart', (e) => (startX = e.touches[0].clientX));
  track.addEventListener('touchend', (e) => {
    const endX = e.changedTouches[0].clientX;
    if (startX - endX > 50) nextBtn.click(); // swipe left
    if (endX - startX > 50) prevBtn.click(); // swipe right
  });
});


/* === LIGHTBOX FUNCTIONALITY === */
const galleryImages = document.querySelectorAll('.gallery-full .photo img');
let currentIndex = 0;

// Create lightbox elements dynamically
const lightbox = document.createElement('div');
lightbox.classList.add('lightbox');
lightbox.innerHTML = `
  <button class="lightbox-btn prev" aria-label="Previous image">❮</button>
  <img src="" alt="Fullscreen view">
  <button class="lightbox-btn next" aria-label="Next image">❯</button>
  <button class="lightbox-close" aria-label="Close lightbox">✕</button>
`;
document.body.appendChild(lightbox);

const lightboxImg = lightbox.querySelector('img');
const btnPrev = lightbox.querySelector('.prev');
const btnNext = lightbox.querySelector('.next');
const btnClose = lightbox.querySelector('.lightbox-close');

// Open lightbox
galleryImages.forEach((img, index) => {
  img.addEventListener('click', () => {
    currentIndex = index;
    openLightbox(img.dataset.full || img.src);
  });
});

function openLightbox(src) {
  lightboxImg.src = src;
  lightbox.classList.add('active');
}

// Close lightbox
btnClose.addEventListener('click', closeLightbox);
lightbox.addEventListener('click', (e) => {
  if (e.target === lightbox) closeLightbox(); // click outside image closes it
});

function closeLightbox() {
  lightbox.classList.remove('active');
  lightboxImg.src = '';
}

// Navigation
btnPrev.addEventListener('click', showPrev);
btnNext.addEventListener('click', showNext);

function showPrev() {
  currentIndex = (currentIndex - 1 + galleryImages.length) % galleryImages.length;
  lightboxImg.src = galleryImages[currentIndex].dataset.full || galleryImages[currentIndex].src;
}

function showNext() {
  currentIndex = (currentIndex + 1) % galleryImages.length;
  lightboxImg.src = galleryImages[currentIndex].dataset.full || galleryImages[currentIndex].src;
}

// Keyboard support
document.addEventListener('keydown', (e) => {
  if (!lightbox.classList.contains('active')) return;
  if (e.key === 'Escape') closeLightbox();
  if (e.key === 'ArrowLeft') showPrev();
  if (e.key === 'ArrowRight') showNext();
});
