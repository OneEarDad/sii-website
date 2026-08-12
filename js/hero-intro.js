/* ============================================
   SII Medical — Hero Intro & Scroll Effects
   Fluid.glass-inspired loading animation,
   scroll-driven video dimming & parallax
   ============================================ */

(function () {
    'use strict';

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* =========================================
       1. INTRO / LOADING ANIMATION
       Logo reveals, line sweeps, then fades
       out to expose the hero beneath
       ========================================= */
    function initIntro() {
        const intro = document.getElementById('intro');
        if (!intro) return;

        if (reducedMotion) {
            intro.remove();
            document.body.classList.add('intro-done');
            return;
        }

        // Prevent scrolling during intro
        document.body.style.overflow = 'hidden';

        // After intro animation completes (CSS handles the timing), fade out
        const totalDuration = 2200; // matches CSS animation timeline

        setTimeout(() => {
            intro.classList.add('intro--leaving');
        }, totalDuration);

        setTimeout(() => {
            intro.remove();
            document.body.style.overflow = '';
            document.body.classList.add('intro-done');
        }, totalDuration + 800); // 800ms for the fade-out
    }

    /* =========================================
       2. SCROLL-DRIVEN HERO EFFECTS
       As user scrolls past hero:
       - Video dims and scales slightly
       - Content fades out and shifts up
       - Orbital rings drift away
       ========================================= */
    function initHeroScrollEffects() {
        const hero = document.getElementById('hero');
        const video = document.getElementById('heroVideo');
        const inner = hero ? hero.querySelector('.hero__inner') : null;
        const orbital = hero ? hero.querySelector('.hero__orbital') : null;
        const scrollIndicator = hero ? hero.querySelector('.hero__scroll-indicator') : null;

        if (!hero || !video || reducedMotion) return;

        let ticking = false;

        function onScroll() {
            if (ticking) return;
            ticking = true;

            requestAnimationFrame(() => {
                const scrollY = window.pageYOffset;
                const heroHeight = hero.offsetHeight;
                const progress = Math.min(scrollY / heroHeight, 1); // 0 to 1

                // Video: dim + subtle scale
                const videoOpacity = 0.9 - progress * 0.7; // 0.9 → 0.2
                const videoScale = 1 + progress * 0.05; // 1 → 1.05
                video.style.opacity = Math.max(videoOpacity, 0);
                video.style.transform = `scale(${videoScale})`;

                // Content: fade out + shift up
                if (inner) {
                    const contentOpacity = 1 - progress * 1.8; // fades faster
                    const contentShift = progress * -60;
                    inner.style.opacity = Math.max(contentOpacity, 0);
                    inner.style.transform = `translateY(${contentShift}px)`;
                }

                // Orbital: drift + fade
                if (orbital) {
                    const orbitalOpacity = 1 - progress * 2;
                    const orbitalShift = progress * -40;
                    orbital.style.opacity = Math.max(orbitalOpacity, 0);
                    orbital.style.transform = `translateY(calc(-50% + ${orbitalShift}px))`;
                }

                // Scroll indicator: fade quickly
                if (scrollIndicator) {
                    scrollIndicator.style.opacity = Math.max(1 - progress * 5, 0);
                }

                ticking = false;
            });
        }

        window.addEventListener('scroll', onScroll, { passive: true });
    }

    /* =========================================
       INIT
       ========================================= */
    function init() {
        initIntro();
        initHeroScrollEffects();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
