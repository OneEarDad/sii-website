/* ============================================
   SII Medical — Global Scroll-Reactive Particle Field
   Lightweight vanilla Canvas animation
   Ambient floating particles that drift and
   shift with scroll position. Runs on ALL pages
   with adaptive density — heavier on homepage,
   lighter on inner pages.
   ============================================ */

(function () {
    'use strict';

    // Respect reduced motion
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const isHomepage = !!document.getElementById('hero');

    /* --- Setup Canvas --- */
    const canvas = document.createElement('canvas');
    canvas.id = 'particleCanvas';
    canvas.setAttribute('aria-hidden', 'true');
    document.body.prepend(canvas);

    const ctx = canvas.getContext('2d');
    let width, height, dpr;
    let scrollY = 0;
    let particles = [];
    let isVisible = true;
    let mouseX = -1000, mouseY = -1000;

    /* --- Configuration (adaptive) --- */
    const CONFIG = isHomepage ? {
        count: Math.min(120, Math.floor(window.innerWidth / 12)),
        baseSpeed: 0.14,
        scrollInfluence: 0.4,
        connectionDist: 160,
        teal: { r: 106, g: 161, b: 161 },
        particleSizeMin: 1.0,
        particleSizeMax: 3.0,
        mouseRadius: 200,
        mouseForce: 0.06,
        connectionAlpha: 0.06,
    } : {
        count: Math.min(60, Math.floor(window.innerWidth / 25)),
        baseSpeed: 0.1,
        scrollInfluence: 0.3,
        connectionDist: 130,
        teal: { r: 106, g: 161, b: 161 },
        particleSizeMin: 0.8,
        particleSizeMax: 2.5,
        mouseRadius: 160,
        mouseForce: 0.04,
        connectionAlpha: 0.04,
    };

    /* --- Particle Class --- */
    class Particle {
        constructor() {
            this.reset(true);
        }

        reset(initial) {
            this.x = Math.random() * width;
            this.y = initial ? Math.random() * height : -10;
            this.baseSize = CONFIG.particleSizeMin + Math.random() * (CONFIG.particleSizeMax - CONFIG.particleSizeMin);
            this.size = this.baseSize;
            this.vx = (Math.random() - 0.5) * CONFIG.baseSpeed;
            this.vy = CONFIG.baseSpeed * 0.2 + Math.random() * CONFIG.baseSpeed * 0.4;
            this.baseOpacity = 0.2 + Math.random() * 0.35;
            this.drift = (Math.random() - 0.5) * 0.25;
            this.phase = Math.random() * Math.PI * 2;
            this.depth = 0.3 + Math.random() * 0.7;
            this.pulseSpeed = 0.005 + Math.random() * 0.01;
        }

        update(scrollDelta) {
            // Sine wave drift
            this.phase += 0.006;
            this.x += this.vx + Math.sin(this.phase) * this.drift;
            this.y += this.vy;

            // Scroll parallax
            this.y += scrollDelta * this.depth * CONFIG.scrollInfluence;

            // Mouse interaction — gentle repulsion
            if (mouseX > 0) {
                const dx = this.x / dpr - mouseX;
                const dy = this.y / dpr - mouseY;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < CONFIG.mouseRadius) {
                    const force = (1 - dist / CONFIG.mouseRadius) * CONFIG.mouseForce;
                    this.x += dx * force * dpr;
                    this.y += dy * force * dpr;
                }
            }

            // Gentle size pulse
            this.size = this.baseSize + Math.sin(this.phase * 1.5) * 0.3;

            // Wrap around
            if (this.y > height + 20) this.reset(false);
            if (this.y < -20) this.y = height + 10;
            if (this.x > width + 20) this.x = -10;
            if (this.x < -20) this.x = width + 10;
        }

        draw(sectionMult) {
            const alpha = this.baseOpacity * sectionMult;
            if (alpha < 0.005) return;

            const { r, g, b } = CONFIG.teal;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size * dpr, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`;
            ctx.fill();
        }
    }

    /* --- Section Detection --- */
    let sectionMap = [];

    // Selectors for dark sections across ALL pages
    const DARK_SELECTORS = [
        // Homepage
        '.hero', '.home-pillars', '.home-trust', '.home-cta',
        // Inner pages
        '.page-header', '.pages-cta--dark',
        '.about-partner--dark',
        '.wsu-reprocessing',
        '.fed-header', '.fed-compliance',
    ];

    const ALL_SECTION_SELECTORS = [
        // Homepage
        '.hero', '.home-ethos', '.home-pillars', '.home-products',
        '.home-trust', '.home-why', '.home-specialties', '.home-cta',
        // Inner pages — broad selectors
        '.page-header', 'section[class]',
    ];

    function buildSectionMap() {
        sectionMap = [];
        const allSections = document.querySelectorAll(ALL_SECTION_SELECTORS.join(', '));
        const darkSet = new Set();
        document.querySelectorAll(DARK_SELECTORS.join(', ')).forEach(el => darkSet.add(el));

        allSections.forEach(s => {
            const rect = s.getBoundingClientRect();
            sectionMap.push({
                top: rect.top + window.pageYOffset,
                bottom: rect.bottom + window.pageYOffset,
                dark: darkSet.has(s),
            });
        });
    }

    function getOpacityMultiplier() {
        const viewCenter = scrollY + window.innerHeight / 2;
        for (const s of sectionMap) {
            if (viewCenter >= s.top && viewCenter <= s.bottom) {
                // Boosted on light sections so the dots stay visible on white too
                return s.dark ? 1.0 : 0.6;
            }
        }
        return 0.4;
    }

    /* --- Draw Connections --- */
    function drawConnections(mult) {
        if (mult < 0.15) return;

        const maxDist = CONFIG.connectionDist * dpr;
        const { r, g, b } = CONFIG.teal;

        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const distSq = dx * dx + dy * dy;

                if (distSq < maxDist * maxDist) {
                    const dist = Math.sqrt(distSq);
                    const lineAlpha = (1 - dist / maxDist) * CONFIG.connectionAlpha * mult;
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${lineAlpha})`;
                    ctx.lineWidth = 0.5 * dpr;
                    ctx.stroke();
                }
            }
        }
    }

    /* --- Animation Loop --- */
    let lastScrollY = 0;
    let frameCount = 0;

    function animate() {
        if (!isVisible) {
            requestAnimationFrame(animate);
            return;
        }

        ctx.clearRect(0, 0, width, height);

        const scrollDelta = scrollY - lastScrollY;
        lastScrollY = scrollY;

        // Rebuild section map occasionally
        frameCount++;
        if (frameCount % 120 === 0) buildSectionMap();

        const mult = getOpacityMultiplier();

        for (const p of particles) {
            p.update(scrollDelta);
            p.draw(mult);
        }

        drawConnections(mult);

        requestAnimationFrame(animate);
    }

    /* --- Resize --- */
    function resize() {
        dpr = Math.min(window.devicePixelRatio, 2);
        width = window.innerWidth * dpr;
        height = window.innerHeight * dpr;
        canvas.width = width;
        canvas.height = height;
        buildSectionMap();
    }

    /* --- Init --- */
    function init() {
        resize();

        particles = [];
        for (let i = 0; i < CONFIG.count; i++) {
            particles.push(new Particle());
        }

        // Scroll
        window.addEventListener('scroll', () => {
            scrollY = window.pageYOffset;
        }, { passive: true });

        // Mouse
        window.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
        }, { passive: true });

        // Resize
        let resizeTimer;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => {
                resize();
                for (const p of particles) {
                    if (p.x > width) p.x = Math.random() * width;
                    if (p.y > height) p.y = Math.random() * height;
                }
            }, 200);
        });

        // Visibility
        document.addEventListener('visibilitychange', () => {
            isVisible = !document.hidden;
        });

        // Build section map after layout settles
        setTimeout(buildSectionMap, 500);

        animate();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
