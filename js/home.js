/* ============================================
   SII Medical — Homepage JavaScript
   Featured products loader
   ============================================ */

(function () {
    'use strict';

    const grid = document.getElementById('featuredProducts');
    if (!grid) return;

    // Image error fallback
    window._homeImgError = function (img) {
        img.style.display = 'none';
        const fallback = document.createElement('div');
        fallback.style.cssText = 'display:flex;align-items:center;justify-content:center;width:100%;height:100%;';
        fallback.innerHTML = '<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--steel-gray)" stroke-width="1"><path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z"/></svg>';
        img.parentElement.appendChild(fallback);
    };

    // Featured product IDs — curated selection across categories
    const featuredIds = [
        'BSDP-04F',    // Basic Care Podiatry Pack
        'SS08-0537F',  // Nipper Ingrown Nail
        'SS08-0539F',  // Thwaites Nail Nipper
        'SS62-6401F',  // Curette Malleable
        'SSP-021F',    // Standard Suture Pack
        'BSDP-03F'     // PNA Procedure Pack
    ];

    async function loadFeatured() {
        try {
            const res = await fetch('data/products.json');
            const data = await res.json();

            const featured = featuredIds
                .map(id => data.products.find(p => p.id === id))
                .filter(Boolean);

            grid.innerHTML = featured.map((p, i) => {
                const main = (Array.isArray(p.images) && p.images[0]) || p.image;
                const hover = Array.isArray(p.images) && p.images[1] ? p.images[1] : null;
                return `
                <a href="shop.html" class="home-product-card animate stagger-${(i % 6) + 1}">
                    <div class="home-product-card__img">
                        ${p.isPack ? '<span class="home-product-card__badge">Pack</span>' : ''}
                        <img class="home-product-card__img-main" src="${main}" alt="${p.name}" loading="lazy" onerror="window._homeImgError(this)">
                        ${hover ? `<img class="home-product-card__img-hover" src="${hover}" alt="" aria-hidden="true" loading="lazy" onerror="this.remove()">` : ''}
                    </div>
                    <div class="home-product-card__body">
                        <span class="home-product-card__category">${p.category}</span>
                        <h3 class="home-product-card__name">${p.name}</h3>
                        <p class="home-product-card__sku">${p.sku}</p>
                    </div>
                </a>
            `}).join('');

            // Trigger scroll animations for dynamically added elements
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('in-view');
                        observer.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

            grid.querySelectorAll('.animate').forEach(el => observer.observe(el));

        } catch (err) {
            grid.innerHTML = '<p style="text-align:center;color:var(--steel-gray);grid-column:1/-1;">Unable to load products.</p>';
        }
    }

    loadFeatured();
})();
