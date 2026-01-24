// Navigation scroll effect
const nav = document.querySelector('.nav');
let lastScroll = 0;

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    
    if (currentScroll > 50) {
        nav.classList.add('scrolled');
    } else {
        nav.classList.remove('scrolled');
    }
    
    lastScroll = currentScroll;
});

// Smooth scroll for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            const navHeight = nav.offsetHeight;
            const targetPosition = target.offsetTop - navHeight;
            
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        }
    });
});

// Intersection Observer for reveal animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
};

const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('active');
            // Stop observing once revealed
            revealObserver.unobserve(entry.target);
        }
    });
}, observerOptions);

// Observe all elements with .reveal class
document.querySelectorAll('.reveal').forEach(el => {
    revealObserver.observe(el);
});

// Observe all elements with .slide-in-right class
document.querySelectorAll('.slide-in-right').forEach(el => {
    revealObserver.observe(el);
});

// Scroll-based color cycling for name
const colors = ['#e74c3c', '#f39c12', '#f1c40f', '#2ecc71', '#3498db', '#9b59b6'];
const colorCycleName = document.querySelector('.color-cycle');

function updateNameColor() {
    if (!colorCycleName) return;
    
    const workSection = document.querySelector('.work');
    if (!workSection) return;
    
    const navHeight = document.querySelector('.nav').offsetHeight;
    const sectionTop = workSection.offsetTop - navHeight;
    const sectionHeight = workSection.offsetHeight;
    const scrollPosition = window.pageYOffset;
    
    // Calculate scroll progress through the work section (0 to 1)
    const scrollProgress = Math.max(0, Math.min(1, (scrollPosition - sectionTop + window.innerHeight * 0.3) / (sectionHeight + window.innerHeight * 0.4)));
    
    // Cycle through colors based on scroll position
    // Multiply by number of colors to get multiple cycles as user scrolls
    const cycles = 3; // Number of times to cycle through all colors
    const colorIndex = Math.floor(scrollProgress * colors.length * cycles) % colors.length;
    
    colorCycleName.style.color = colors[colorIndex];
}

// Update color on scroll
window.addEventListener('scroll', throttle(updateNameColor, 15));
updateNameColor(); // Initial call

// Parallax effect for hero section
let heroContent = document.querySelector('.hero-content');
if (heroContent) {
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        const hero = document.querySelector('.hero');
        if (hero && scrolled < hero.offsetHeight) {
            heroContent.style.transform = `translateY(${scrolled * 0.3}px)`;
            heroContent.style.opacity = 1 - (scrolled / hero.offsetHeight) * 0.5;
        }
    });
}

// Project hover effects
document.querySelectorAll('.project').forEach(project => {
    project.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-10px)';
    });
    
    project.addEventListener('mouseleave', function() {
        this.style.transform = 'translateY(0)';
    });
});

// Add stagger effect to project reveals
const projects = document.querySelectorAll('.project');
projects.forEach((project, index) => {
    project.style.transitionDelay = `${index * 0.1}s`;
});

// Scroll progress indicator (optional enhancement)
const createScrollProgress = () => {
    const progressBar = document.createElement('div');
    progressBar.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 0%;
        height: 3px;
        background: linear-gradient(90deg, #43AB92, #2892CF);
        z-index: 9999;
        transition: width 0.1s ease;
    `;
    document.body.appendChild(progressBar);
    
    window.addEventListener('scroll', () => {
        const windowHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrolled = (window.pageYOffset / windowHeight) * 100;
        progressBar.style.width = scrolled + '%';
    });
};

// Initialize scroll progress
createScrollProgress();

// Add active state to navigation based on scroll position
const updateActiveNav = () => {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-links a');
    
    let current = '';
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        if (window.pageYOffset >= sectionTop - 200) {
            current = section.getAttribute('id');
        }
    });
    
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${current}`) {
            link.classList.add('active');
        }
    });
};

window.addEventListener('scroll', updateActiveNav);
updateActiveNav();

// Add fade-in animation on page load
window.addEventListener('load', () => {
    document.body.style.opacity = '0';
    setTimeout(() => {
        document.body.style.transition = 'opacity 0.5s ease';
        document.body.style.opacity = '1';
    }, 100);
});

// Performance optimization: Throttle scroll events
function throttle(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Apply throttling to scroll-heavy functions
const throttledScroll = throttle(() => {
    updateActiveNav();
}, 100);

window.addEventListener('scroll', throttledScroll);
