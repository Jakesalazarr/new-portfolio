// ==========================================
// CUSTOM ANIMATED CURSOR WITH TRAILS
// ==========================================

class CustomCursor {
    constructor() {
        this.cursor = document.createElement('div');
        this.cursor.classList.add('cursor');
        document.body.appendChild(this.cursor);

        this.trails = [];
        this.maxTrails = 15;
        this.trailColors = [
            'rgba(99, 102, 241, 0.6)',   // Primary purple
            'rgba(129, 140, 248, 0.5)',  // Light purple
            'rgba(236, 72, 153, 0.4)',   // Pink
            'rgba(6, 182, 212, 0.4)',    // Cyan
            'rgba(139, 92, 246, 0.5)'    // Violet
        ];

        this.mouseX = 0;
        this.mouseY = 0;
        this.cursorX = 0;
        this.cursorY = 0;

        this.init();
    }

    init() {
        // Create trail elements
        for (let i = 0; i < this.maxTrails; i++) {
            const trail = document.createElement('div');
            trail.classList.add('cursor-trail');
            trail.style.opacity = '0';
            document.body.appendChild(trail);
            this.trails.push({
                element: trail,
                x: 0,
                y: 0
            });
        }

        // Mouse move event
        document.addEventListener('mousemove', (e) => {
            this.mouseX = e.clientX;
            this.mouseY = e.clientY;
        });

        // Hover effects
        const hoverElements = document.querySelectorAll('a, button, .project-card, .btn, .contact-link, .skill-category, .timeline-content');
        hoverElements.forEach(el => {
            el.addEventListener('mouseenter', () => {
                this.cursor.classList.add('hover');
            });
            el.addEventListener('mouseleave', () => {
                this.cursor.classList.remove('hover');
            });
        });

        this.animate();
    }

    animate() {
        // Smooth cursor follow
        this.cursorX += (this.mouseX - this.cursorX) * 0.15;
        this.cursorY += (this.mouseY - this.cursorY) * 0.15;

        this.cursor.style.left = this.cursorX + 'px';
        this.cursor.style.top = this.cursorY + 'px';

        // Update trails with delay and color
        for (let i = this.trails.length - 1; i > 0; i--) {
            this.trails[i].x += (this.trails[i - 1].x - this.trails[i].x) * 0.3;
            this.trails[i].y += (this.trails[i - 1].y - this.trails[i].y) * 0.3;

            const trail = this.trails[i];
            const delay = i / this.maxTrails;
            const opacity = 1 - delay;
            const scale = 1 - (delay * 0.5);

            trail.element.style.left = trail.x + 'px';
            trail.element.style.top = trail.y + 'px';
            trail.element.style.opacity = opacity * 0.8;
            trail.element.style.transform = `translate(-50%, -50%) scale(${scale})`;
            trail.element.style.background = this.trailColors[i % this.trailColors.length];

            // Add glow effect
            trail.element.style.boxShadow = `0 0 ${10 * scale}px ${this.trailColors[i % this.trailColors.length]}`;
        }

        // First trail follows cursor directly
        this.trails[0].x = this.cursorX;
        this.trails[0].y = this.cursorY;

        requestAnimationFrame(() => this.animate());
    }
}

// ==========================================
// SMOOTH SCROLL & NAVIGATION
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
    // Initialize custom cursor
    new CustomCursor();

    // Smooth scroll for navigation links
    const navLinks = document.querySelectorAll('.nav-link');

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href');
            const targetSection = document.querySelector(targetId);

            if (targetSection) {
                targetSection.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Mobile menu toggle
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const navLinksContainer = document.querySelector('.nav-links');

    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', () => {
            navLinksContainer.classList.toggle('active');
            mobileMenuBtn.classList.toggle('active');
        });
    }

    // Close mobile menu when clicking a nav link
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            navLinksContainer.classList.remove('active');
            mobileMenuBtn.classList.remove('active');
        });
    });

    // ==========================================
    // SCROLL ANIMATIONS
    // ==========================================

    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const animateOnScroll = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Animate project cards
    const projectCards = document.querySelectorAll('.project-card');
    projectCards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        card.style.transition = `all 0.6s ease ${index * 0.1}s`;
        animateOnScroll.observe(card);
    });

    // Animate timeline items
    const timelineItems = document.querySelectorAll('.timeline-item');
    timelineItems.forEach((item, index) => {
        item.style.opacity = '0';
        item.style.transform = 'translateX(-30px)';
        item.style.transition = `all 0.6s ease ${index * 0.15}s`;
        animateOnScroll.observe(item);
    });

    // Animate skill categories
    const skillCategories = document.querySelectorAll('.skill-category');
    skillCategories.forEach((category, index) => {
        category.style.opacity = '0';
        category.style.transform = 'translateY(30px)';
        category.style.transition = `all 0.6s ease ${index * 0.1}s`;
        animateOnScroll.observe(category);
    });

    // ==========================================
    // NAVIGATION SCROLL EFFECT
    // ==========================================

    const nav = document.querySelector('.nav');
    let lastScroll = 0;

    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;

        if (currentScroll > 100) {
            nav.style.background = 'rgba(10, 14, 26, 0.95)';
            nav.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.1)';
        } else {
            nav.style.background = 'rgba(10, 14, 26, 0.8)';
            nav.style.boxShadow = 'none';
        }

        lastScroll = currentScroll;
    });

    // ==========================================
    // ACTIVE NAVIGATION LINK
    // ==========================================

    const sections = document.querySelectorAll('section[id]');

    window.addEventListener('scroll', () => {
        const scrollY = window.pageYOffset;

        sections.forEach(section => {
            const sectionHeight = section.offsetHeight;
            const sectionTop = section.offsetTop - 100;
            const sectionId = section.getAttribute('id');
            const navLink = document.querySelector(`.nav-link[href="#${sectionId}"]`);

            if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
                navLinks.forEach(link => link.classList.remove('active'));
                if (navLink) navLink.classList.add('active');
            }
        });
    });

    // ==========================================
    // SKILL BAR ANIMATIONS
    // ==========================================

    const skillObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const skillBars = entry.target.querySelectorAll('.skill-progress');
                skillBars.forEach((bar, index) => {
                    setTimeout(() => {
                        bar.style.width = bar.style.width; // Trigger animation
                    }, index * 100);
                });
                skillObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    const skillsSection = document.querySelector('.skills');
    if (skillsSection) {
        skillObserver.observe(skillsSection);
    }

    // ==========================================
    // CURSOR EFFECTS ON CARDS
    // ==========================================

    const cards = document.querySelectorAll('.project-card, .timeline-content, .skill-category');

    cards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            const rotateX = (y - centerY) / 20;
            const rotateY = (centerX - x) / 20;

            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateY(0)';
        });
    });

    // ==========================================
    // CONSOLE EASTER EGG
    // ==========================================

    console.log('%c👋 Hello Developer!', 'font-size: 20px; font-weight: bold; color: #6366f1;');
    console.log('%cLooking at the code? I like your style!', 'font-size: 14px; color: #94a3b8;');
    console.log('%cFeel free to reach out if you want to collaborate!', 'font-size: 14px; color: #94a3b8;');
    console.log('%cJacob Israel R. Salazar', 'font-size: 12px; color: #818cf8;');
    console.log('%csalazarjake44@gmail.com', 'font-size: 12px; color: #818cf8;');
});
