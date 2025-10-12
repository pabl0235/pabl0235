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

