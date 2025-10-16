// ==========================================
// STARFIELD CANVAS WITH CURSOR REPULSION
// ==========================================

class Star {
    constructor(canvas) {
        this.canvas = canvas;
        this.reset();
        // Random initial position
        this.x = Math.random() * this.canvas.width;
        this.y = Math.random() * this.canvas.height;
    }

    reset() {
        this.x = Math.random() * this.canvas.width;
        this.y = Math.random() * this.canvas.height;
        this.z = Math.random() * this.canvas.width;
        this.size = Math.random() * 2 + 0.5;
        this.speed = Math.random() * 0.5 + 0.1;

        // Cursor repulsion properties
        this.vx = 0;
        this.vy = 0;
        this.originalX = this.x;
        this.originalY = this.y;
    }

    update(mouseX, mouseY) {
        // Move star towards viewer
        this.z -= this.speed;

        // Reset if star goes behind
        if (this.z <= 0) {
            this.reset();
        }

        // Cursor repulsion effect
        const dx = this.x - mouseX;
        const dy = this.y - mouseY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const repulsionRadius = 150;

        if (distance < repulsionRadius && distance > 0) {
            const force = (repulsionRadius - distance) / repulsionRadius;
            const angle = Math.atan2(dy, dx);
            this.vx += Math.cos(angle) * force * 2;
            this.vy += Math.sin(angle) * force * 2;
        }

        // Apply velocity and friction
        this.x += this.vx;
        this.y += this.vy;
        this.vx *= 0.95;
        this.vy *= 0.95;

        // Gently return to original position
        const returnForce = 0.02;
        this.x += (this.originalX - this.x) * returnForce;
        this.y += (this.originalY - this.y) * returnForce;

        // Keep within bounds
        if (this.x < 0 || this.x > this.canvas.width ||
            this.y < 0 || this.y > this.canvas.height) {
            this.reset();
            this.originalX = this.x;
            this.originalY = this.y;
        }
    }

    draw(ctx) {
        const scale = 1000 / this.z;
        const x2d = (this.x - this.canvas.width / 2) * scale + this.canvas.width / 2;
        const y2d = (this.y - this.canvas.height / 2) * scale + this.canvas.height / 2;
        const size = this.size * scale;

        // Only draw if within canvas bounds
        if (x2d < -50 || x2d > this.canvas.width + 50 ||
            y2d < -50 || y2d > this.canvas.height + 50) {
            return;
        }

        // Star brightness based on distance
        const brightness = Math.min(1, 1000 / this.z);
        const alpha = brightness * 0.8;

        // Draw star with glow
        ctx.beginPath();
        const gradient = ctx.createRadialGradient(x2d, y2d, 0, x2d, y2d, size * 2);
        gradient.addColorStop(0, `rgba(255, 255, 255, ${alpha})`);
        gradient.addColorStop(0.5, `rgba(150, 180, 255, ${alpha * 0.5})`);
        gradient.addColorStop(1, `rgba(100, 120, 200, 0)`);

        ctx.fillStyle = gradient;
        ctx.arc(x2d, y2d, size * 2, 0, Math.PI * 2);
        ctx.fill();

        // Draw motion trail for faster stars
        if (this.speed > 0.3) {
            const trailLength = 20;
            const prevZ = this.z + this.speed * trailLength;
            const prevScale = 1000 / prevZ;
            const prevX = (this.x - this.canvas.width / 2) * prevScale + this.canvas.width / 2;
            const prevY = (this.y - this.canvas.height / 2) * prevScale + this.canvas.height / 2;

            ctx.beginPath();
            ctx.strokeStyle = `rgba(255, 255, 255, ${alpha * 0.3})`;
            ctx.lineWidth = size * 0.5;
            ctx.moveTo(prevX, prevY);
            ctx.lineTo(x2d, y2d);
            ctx.stroke();
        }
    }
}

class Starfield {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) return;

        this.ctx = this.canvas.getContext('2d');
        this.stars = [];
        this.mouseX = this.canvas.width / 2;
        this.mouseY = this.canvas.height / 2;
        this.targetMouseX = this.mouseX;
        this.targetMouseY = this.mouseY;

        this.init();
        this.setupEventListeners();
        this.animate();
    }

    init() {
        this.resize();
        // Create stars
        const numStars = Math.floor((this.canvas.width * this.canvas.height) / 5000);
        for (let i = 0; i < numStars; i++) {
            this.stars.push(new Star(this.canvas));
        }
    }

    resize() {
        const hero = document.querySelector('.hero');
        if (hero) {
            this.canvas.width = hero.offsetWidth;
            this.canvas.height = hero.offsetHeight;
        }
    }

    setupEventListeners() {
        window.addEventListener('resize', () => {
            this.resize();
        });

        this.canvas.addEventListener('mousemove', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            this.targetMouseX = e.clientX - rect.left;
            this.targetMouseY = e.clientY - rect.top;
        });

        this.canvas.addEventListener('mouseleave', () => {
            this.targetMouseX = this.canvas.width / 2;
            this.targetMouseY = this.canvas.height / 2;
        });
    }

    animate() {
        // Smooth mouse following
        this.mouseX += (this.targetMouseX - this.mouseX) * 0.1;
        this.mouseY += (this.targetMouseY - this.mouseY) * 0.1;

        // Clear canvas with fade effect
        this.ctx.fillStyle = 'rgba(10, 14, 26, 0.3)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Update and draw stars
        this.stars.forEach(star => {
            star.update(this.mouseX, this.mouseY);
            star.draw(this.ctx);
        });

        requestAnimationFrame(() => this.animate());
    }
}

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

    // Initialize starfield
    new Starfield('starfield');

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
    // PRELOAD PERFORMANCE
    // ==========================================

    // Preload critical resources
    const preloadLinks = [
        './01-kura-angular/index.html',
        './02-vogue-react/index.html',
        './03-chatai-python/index.html',
        './04-analytics-dashboard/index.html'
    ];

    preloadLinks.forEach(href => {
        const link = document.createElement('link');
        link.rel = 'prefetch';
        link.href = href;
        document.head.appendChild(link);
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
