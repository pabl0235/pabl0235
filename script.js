const menuBtn = document.querySelector('.menu-btn');
const navLinks = document.querySelector('.nav-links');

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