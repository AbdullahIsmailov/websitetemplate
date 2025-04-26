// Smooth scrolling for navigation links (both header and footer)
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
            
            // Close mobile menu if open
            const navbarCollapse = document.querySelector('.navbar-collapse');
            if (navbarCollapse.classList.contains('show')) {
                navbarCollapse.classList.remove('show');
            }
        }
    });
});

// Active navigation state on scroll
window.addEventListener('scroll', function() {
    let sections = document.querySelectorAll('section[id]');
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop - 100;
        const sectionHeight = section.offsetHeight;
        const scroll = window.scrollY;
        const navLinks = document.querySelectorAll('.nav-link');
        
        if (scroll >= sectionTop && scroll < sectionTop + sectionHeight) {
            navLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === '#' + section.getAttribute('id')) {
                    link.classList.add('active');
                }
            });
        }
    });
});

// Mobile menu handling
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', function() {
        const navbarCollapse = document.querySelector('.navbar-collapse');
        if (navbarCollapse.classList.contains('show')) {
            navbarCollapse.classList.remove('show');
        }
    });
});

// Video card hover effect
document.querySelectorAll('.video-card').forEach(card => {
    card.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-5px)';
        this.style.transition = 'transform 0.3s ease';
    });
    
    card.addEventListener('mouseleave', function() {
        this.style.transform = 'translateY(0)';
    });
});

// Enhanced Language switcher
document.querySelectorAll('.dropdown-item').forEach(item => {
    item.addEventListener('click', function() {
        const selectedLang = this.textContent;
        const globeIcon = document.querySelector('.fa-globe');
        const dropdownToggle = document.querySelector('.dropdown-toggle');
        
        // Add rotation animation to globe icon
        globeIcon.style.transform = 'rotate(360deg)';
        globeIcon.style.transition = 'transform 0.5s ease';
        
        // Update globe icon color with a pulse effect
        globeIcon.style.color = '#007bff';
        globeIcon.style.animation = 'pulse 0.5s ease';
        
        // Update dropdown toggle text with selected language
        dropdownToggle.innerHTML = `<i class="fa fa-globe"></i> ${selectedLang}`;
        
        // Add a checkmark to the selected language
        document.querySelectorAll('.dropdown-item').forEach(i => {
            i.innerHTML = i.textContent;
        });
        this.innerHTML = `${selectedLang} <i class="fas fa-check"></i>`;
        
        // Reset animations after they complete
        setTimeout(() => {
            globeIcon.style.transform = 'none';
            globeIcon.style.animation = 'none';
        }, 500);
        
        // Navigate to the selected language page
        window.location.href = this.getAttribute('href');
    });
});

// Navbar scroll effect
let lastScroll = 0;
const navbar = document.querySelector('.navbar');

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    
    if (currentScroll <= 0) {
        navbar.classList.remove('scroll-up');
        return;
    }
    
    if (currentScroll > lastScroll && !navbar.classList.contains('scroll-down')) {
        // Scroll Down
        navbar.classList.remove('scroll-up');
        navbar.classList.add('scroll-down');
    } else if (currentScroll < lastScroll && navbar.classList.contains('scroll-down')) {
        // Scroll Up
        navbar.classList.remove('scroll-down');
        navbar.classList.add('scroll-up');
    }
    lastScroll = currentScroll;
});

// Add loading animation for images
document.querySelectorAll('img').forEach(img => {
    // Set initial opacity
    img.style.opacity = '1';
    
    img.addEventListener('load', function() {
        this.classList.add('loaded');
    });
    
    // If image is already loaded
    if (img.complete) {
        img.classList.add('loaded');
    }
});

// Intersection Observer for fade-in animations
const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.1
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('fade-in');
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

// Observe all sections
document.querySelectorAll('section').forEach(section => {
    section.classList.add('fade-out');
    observer.observe(section);
});

document.addEventListener('DOMContentLoaded', function() {
    // Initialize articles list
    const articlesList = document.querySelector('.articles-list');
    const seeMoreBtn = document.querySelector('.see-more-btn');
    const articlesShown = 3; // Number of articles to show initially

    if (articlesList && seeMoreBtn) {
        const articles = articlesList.querySelectorAll('.article-item');
        let isExpanded = false;

        // Initially hide articles beyond the first three
        articles.forEach((article, index) => {
            if (index >= articlesShown) {
                article.style.display = 'none';
            }
        });

        // Toggle articles visibility
        window.toggleArticles = function() {
            isExpanded = !isExpanded;
            const buttonText = seeMoreBtn.querySelector('.see-more-text');
            const buttonIcon = seeMoreBtn.querySelector('.fas');

            articles.forEach((article, index) => {
                if (index >= articlesShown) {
                    article.style.display = isExpanded ? 'block' : 'none';
                }
            });

            if (isExpanded) {
                buttonText.textContent = 'Показать меньше';
                buttonIcon.classList.remove('fa-chevron-down');
                buttonIcon.classList.add('fa-chevron-up');
            } else {
                buttonText.textContent = 'Показать больше';
                buttonIcon.classList.remove('fa-chevron-up');
                buttonIcon.classList.add('fa-chevron-down');
            }
        };

        // Hide the button if there are fewer articles than the threshold
        if (articles.length <= articlesShown) {
            seeMoreBtn.style.display = 'none';
        }
    }

    // Language switcher functionality
    const languageLinks = document.querySelectorAll('.dropdown-menu .dropdown-item');

    languageLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetLanguage = this.getAttribute('href');
            if (targetLanguage) {
                window.location.href = targetLanguage;
            }
        });
    });
});