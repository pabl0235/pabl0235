const menuBtn = document.querySelector('.menu-btn');
const navLinks = document.querySelector('.nav-links');

const navbar = document.querySelector('.navbar');

// Variables to track scroll position
let lastScrollY = window.scrollY; // Store the previous vertical scroll position

// Function to handle the smart navbar behavior
function handleNavbarScroll() {
    // Current scroll position
    const currentScrollY = window.scrollY;

    // Check if scrolling down AND past the top of the page (to prevent instant hide on load)
    if (currentScrollY > lastScrollY && currentScrollY > 50) { 
        // User is scrolling DOWN - hide the navbar
        navbar.classList.add('navbar-hidden');
    } 
    // Check if scrolling up OR near the very top of the page
    else if (currentScrollY < lastScrollY || currentScrollY < 50) { 
        // User is scrolling UP or is near the top - show the navbar
        navbar.classList.remove('navbar-hidden');
    }

    // Update the last known scroll position
    lastScrollY = currentScrollY;
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