/* ============================================
   SII Medical — Interactive Effects
   Hero text reveals, card tilt, cursor glow
   ============================================ */

(function () {
    'use strict';

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* =========================================
       1. HERO TEXT STAGGERED ENTRANCE
       Animates .pages-header__label, h1, p
       with staggered slide-up + fade
       ========================================= */
    function initHeroTextReveal() {
        const header = document.querySelector('.pages-header, .page-header');
        if (!header) return;

        const label = header.querySelector('.pages-header__label, .about-header__label, .fed-header__label, .wsu-header__label');
        const h1 = header.querySelector('h1');
        const p = header.querySelector('p');
        const extras = header.querySelectorAll('.fed-header__badges, .wsu-header__badges');

        const elements = [label, h1, p, ...extras].filter(Boolean);

        if (reducedMotion) {
            elements.forEach(el => {
                el.style.opacity = '1';
                el.style.transform = 'none';
            });
            return;
        }

        // Set initial state
        elements.forEach((el, i) => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(30px)';
            el.style.transition = `opacity 0.7s cubic-bezier(.62, .16, .13, 1.01) ${0.15 + i * 0.12}s, transform 0.7s cubic-bezier(.62, .16, .13, 1.01) ${0.15 + i * 0.12}s`;
        });

        // Trigger after a frame
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                elements.forEach(el => {
                    el.style.opacity = '1';
                    el.style.transform = 'translateY(0)';
                });
            });
        });
    }

    /* =========================================
       2. INTERACTIVE CARD TILT
       3D perspective tilt on hover for cards
       ========================================= */
    function initCardTilt() {
        if (reducedMotion) return;
        // Only on desktop
        if (window.innerWidth < 900) return;

        const cards = document.querySelectorAll(
            '.video-card, .blog-card, .home-pillars__card, .home-product-card, ' +
            '.fed-compliance__card, .fed-facility__card, .fed-order__step, ' +
            '.wsu-solution__card, .wsu-benefit__card, .about-value__card'
        );

        cards.forEach(card => {
            card.style.transformStyle = 'preserve-3d';
            card.style.transition = 'transform 0.4s cubic-bezier(.62, .16, .13, 1.01)';

            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;

                // Normalize to -1 to 1
                const rotateY = ((x - centerX) / centerX) * 4;  // max 4deg
                const rotateX = ((centerY - y) / centerY) * 4;

                card.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
            });

            card.addEventListener('mouseleave', () => {
                card.style.transform = 'perspective(800px) rotateX(0) rotateY(0) translateY(0)';
            });
        });
    }

    /* =========================================
       3. CURSOR GLOW ON DARK SECTIONS
       Soft radial gradient follows mouse
       on dark backgrounds
       ========================================= */
    function initCursorGlow() {
        if (reducedMotion) return;
        if (window.innerWidth < 900) return;

        const darkSections = document.querySelectorAll(
            '.page-header, .pages-cta--dark, .home-pillars, .home-trust, .home-cta, ' +
            '.about-partner--dark, .wsu-reprocessing, .fed-compliance'
        );

        darkSections.forEach(section => {
            // Create glow element
            const glow = document.createElement('div');
            glow.className = 'cursor-glow';
            glow.setAttribute('aria-hidden', 'true');
            section.style.position = section.style.position || 'relative';
            section.style.overflow = 'hidden';
            section.appendChild(glow);

            let rafId = null;

            section.addEventListener('mousemove', (e) => {
                if (rafId) return;
                rafId = requestAnimationFrame(() => {
                    const rect = section.getBoundingClientRect();
                    const x = e.clientX - rect.left;
                    const y = e.clientY - rect.top;
                    glow.style.left = x + 'px';
                    glow.style.top = y + 'px';
                    glow.style.opacity = '1';
                    rafId = null;
                });
            });

            section.addEventListener('mouseleave', () => {
                glow.style.opacity = '0';
            });
        });
    }

    /* =========================================
       4. SMOOTH SECTION PARALLAX
       Subtle depth on scroll for alternating
       sections — makes pages feel layered
       ========================================= */
    function initSectionParallax() {
        if (reducedMotion) return;

        const parallaxElements = document.querySelectorAll(
            '.faq-group__title, .contact-info__card, ' +
            '.fed-stats__item, .wsu-hai__stat'
        );

        if (parallaxElements.length === 0) return;

        let ticking = false;
        window.addEventListener('scroll', () => {
            if (ticking) return;
            ticking = true;
            requestAnimationFrame(() => {
                const scrollY = window.pageYOffset;
                parallaxElements.forEach(el => {
                    const rect = el.getBoundingClientRect();
                    const inView = rect.top < window.innerHeight && rect.bottom > 0;
                    if (inView) {
                        const offset = (rect.top - window.innerHeight / 2) * 0.03;
                        el.style.transform = `translateY(${offset}px)`;
                    }
                });
                ticking = false;
            });
        }, { passive: true });
    }

    /* =========================================
       INIT ALL
       ========================================= */
    function init() {
        initHeroTextReveal();
        initCardTilt();
        initCursorGlow();
        initSectionParallax();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
