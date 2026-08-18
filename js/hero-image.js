/* ============================================
   SII Medical — Interactive Hero Images
   Parallax scroll + mouse-tracking shift
   ============================================ */
(function () {
    'use strict';

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const heroes = document.querySelectorAll('.hero-img');
    if (!heroes.length) return;

    /* --- Read per-hero scale (data-scale attribute, default 1.15) --- */
    function getScale(hero) {
        return parseFloat(hero.dataset.scale) || 1.15;
    }

    /* --- Scroll Parallax --- */
    let ticking = false;
    function onScroll() {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(function () {
            const scrollY = window.scrollY;
            heroes.forEach(function (hero) {
                const rect = hero.getBoundingClientRect();
                const inView = rect.bottom > 0 && rect.top < window.innerHeight;
                if (!inView) return;
                var scale = getScale(hero);
                var offset = scrollY * 0.3;
                var img = hero.querySelector('.hero-img__photo');
                if (img) {
                    img.style.transform = 'translate3d(0,' + offset + 'px,0) scale(' + scale + ')';
                }
            });
            ticking = false;
        });
    }

    /* --- Mouse-Tracking Shift --- */
    function onMouseMove(e) {
        heroes.forEach(function (hero) {
            var rect = hero.getBoundingClientRect();
            if (e.clientY < rect.top || e.clientY > rect.bottom) return;

            var centerX = rect.left + rect.width / 2;
            var centerY = rect.top + rect.height / 2;
            var dx = (e.clientX - centerX) / (rect.width / 2);
            var dy = (e.clientY - centerY) / (rect.height / 2);
            var moveX = dx * 15;
            var moveY = dy * 10;
            var scale = getScale(hero);

            var img = hero.querySelector('.hero-img__photo');
            if (img) {
                var scrollOffset = window.scrollY * 0.3;
                img.style.transform =
                    'translate3d(' + moveX + 'px,' + (scrollOffset + moveY) + 'px,0) scale(' + scale + ')';
            }
            /* Overlay is a fixed editorial scrim now — only the photo parallaxes. */
        });
    }

    /* --- Reveal Animation on Load --- */
    heroes.forEach(function (hero) {
        const img = hero.querySelector('.hero-img__photo');
        if (!img) return;

        // Set initial state
        hero.classList.add('hero-img--loading');

        // If already loaded (cached), reveal immediately
        if (img.tagName === 'IMG' && img.complete) {
            requestAnimationFrame(function () {
                hero.classList.remove('hero-img--loading');
                hero.classList.add('hero-img--loaded');
            });
        } else {
            img.addEventListener('load', function () {
                hero.classList.remove('hero-img--loading');
                hero.classList.add('hero-img--loaded');
            });
            // Fallback if load event doesn't fire
            setTimeout(function () {
                hero.classList.remove('hero-img--loading');
                hero.classList.add('hero-img--loaded');
            }, 2000);
        }
    });

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('mousemove', onMouseMove, { passive: true });

    // Initial position
    onScroll();
})();
