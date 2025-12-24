document.addEventListener('DOMContentLoaded', () => {
    // Dark Mode Toggle
    const toggleButton = document.getElementById('toggle-dark-mode');
    const body = document.body;

    // Check for saved user preference, if any, on load of the website
    if (localStorage.getItem('theme') === 'dark') {
        body.classList.add('dark-mode');
    }

    if (toggleButton) {
        toggleButton.addEventListener('click', () => {
            body.classList.toggle('dark-mode');

            // Save preference
            if (body.classList.contains('dark-mode')) {
                localStorage.setItem('theme', 'dark');
            } else {
                localStorage.setItem('theme', 'light');
            }
        });
    }

    // Scroll Animation (Fade In)
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target); // Only animate once
            }
        });
    }, observerOptions);

    const sections = document.querySelectorAll('.fade-in-section');
    sections.forEach(section => {
        observer.observe(section);
    });

    // Mobile Menu Toggle (Simple implementation)
    const mobileMenuButton = document.querySelector('button.md\\:hidden');
    const navMenu = document.querySelector('nav .md\\:flex');

    if(mobileMenuButton) {
        mobileMenuButton.addEventListener('click', () => {
             // Toggle logic for mobile menu would go here.
             // Since the current HTML structure hides the menu on mobile with 'hidden md:flex',
             // we would need to toggle 'hidden' class or have a separate mobile menu container.
             // For now, let's just log it or maybe add a simple alert for demo purposes
             // or implement a basic toggle if structure supported it easily.
             // A proper mobile menu requires extra HTML structure.
             alert("Mobile menu clicked - Implementation pending detailed design");
        });
    }
});
