/* ============================================
   Home — Instrument marquee + click-to-detail
   Endless horizontal scroll of product photos.
   Each item opens a product-detail modal on click.
   ============================================ */
(function () {
    'use strict';

    const track = document.getElementById('marqueeTrack');
    if (!track) return;

    // Products whose primary photo has a white background — visually
    // inconsistent with the rest of the catalog (blue surgical drape),
    // so they're skipped in the marquee. The shop page still shows them.
    const WHITE_BG_IDS = new Set([
        'SS07-0284F',       // Iris Curved Scissors
        'SUCTION-MAGILL',   // Suction Tube Magill
        'SSP-024F',         // Suture Pack Set
        'S-TQS',            // Digital Tourniquet Small
        'S-TQM',            // Digital Tourniquet Medium
        'S-TQL',            // Digital Tourniquet Large
    ]);

    // Map of id -> product, for fast modal lookup
    const productsById = new Map();

    function buildItem(product) {
        const item = document.createElement('div');
        item.className = 'home-marquee__item';
        item.setAttribute('role', 'button');
        item.setAttribute('tabindex', '0');
        item.setAttribute('aria-label', `${product.name} — view details`);
        item.dataset.id = product.id;

        const img = document.createElement('img');
        img.src = product.images[0];
        img.alt = product.name;
        img.loading = 'lazy';
        img.decoding = 'async';
        img.onerror = () => item.remove();

        const card = document.createElement('div');
        card.className = 'home-marquee__card';
        card.appendChild(img);
        item.appendChild(card);

        const label = document.createElement('div');
        label.className = 'home-marquee__label';
        label.innerHTML = `
            <span class="home-marquee__category">${product.category}</span>
            <span class="home-marquee__name">${product.name}</span>
        `;
        item.appendChild(label);

        const open = () => openModal(product.id);
        item.addEventListener('click', open);
        item.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                open();
            }
        });

        return item;
    }

    /* ============================================
       Modal (mirrors shop.js modal behaviour but
       self-contained so it works on the home page)
       ============================================ */
    function ensureModalRoot() {
        let modal = document.getElementById('productModal');
        if (modal) return modal;
        modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.id = 'productModal';
        modal.innerHTML = `
            <div class="modal-content shop__modal">
                <button class="shop__modal-close" id="modalClose" type="button" aria-label="Close">&times;</button>
                <div class="shop__modal-body" id="modalBody"></div>
            </div>
        `;
        document.body.appendChild(modal);

        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeModal();
        });
        modal.querySelector('#modalClose').addEventListener('click', closeModal);
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && modal.classList.contains('active')) closeModal();
        });
        return modal;
    }

    function imgErrorHandler(img) {
        img.style.display = 'none';
    }
    // Expose for inline onerror in the rendered HTML
    window._marqueeImgError = imgErrorHandler;

    function openModal(productId) {
        const p = productsById.get(productId);
        if (!p) return;

        const modal = ensureModalRoot();
        const body = modal.querySelector('#modalBody');

        const gallery = (Array.isArray(p.images) && p.images.length) ? p.images : [p.image].filter(Boolean);
        const hasMulti = gallery.length > 1;
        const arrowSvg = (dir) => `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="${dir === 'prev' ? '15 18 9 12 15 6' : '9 18 15 12 9 6'}"/></svg>`;

        body.innerHTML = `
            <div class="shop__modal-gallery" data-active="0">
                <div class="shop__modal-img">
                    <img class="shop__modal-img-main" src="${gallery[0]}" alt="${p.name}" onerror="window._marqueeImgError(this)">
                    ${hasMulti ? `
                    <button class="shop__modal-arrow shop__modal-arrow--prev" type="button" aria-label="Previous image">${arrowSvg('prev')}</button>
                    <button class="shop__modal-arrow shop__modal-arrow--next" type="button" aria-label="Next image">${arrowSvg('next')}</button>
                    <div class="shop__modal-counter" aria-live="polite"><span class="shop__modal-counter-current">1</span> / ${gallery.length}</div>
                    ` : ''}
                </div>
                ${hasMulti ? `
                <div class="shop__modal-thumbs" role="tablist" aria-label="Product images">
                    ${gallery.map((src, i) => `
                        <button class="shop__modal-thumb${i === 0 ? ' is-active' : ''}" data-index="${i}" role="tab" aria-selected="${i === 0}" aria-label="View image ${i + 1} of ${gallery.length}">
                            <img src="${src}" alt="" loading="lazy" onerror="this.parentElement.remove()">
                        </button>
                    `).join('')}
                </div>` : ''}
            </div>
            <div class="shop__modal-info">
                <span class="shop__card-category">${p.category}</span>
                <h2>${p.name}</h2>
                ${p.size ? `<p class="shop__modal-size">${p.size}</p>` : ''}
                <p class="shop__modal-sku">SKU: ${p.sku}</p>
                <p class="shop__modal-desc">${p.description}</p>
                <div class="shop__modal-details">
                    <div class="shop__modal-detail">
                        <strong>Box Quantity</strong>
                        <span>${p.boxQty} units</span>
                    </div>
                    <div class="shop__modal-detail">
                        <strong>Specialties</strong>
                        <span>${p.specialties.join(', ')}</span>
                    </div>
                    ${p.federal ? `
                    <div class="shop__modal-detail">
                        <strong>Federal</strong>
                        <span>TAA/BAA Compliant</span>
                    </div>` : ''}
                    ${p.isPack && p.packContents ? `
                    <div class="shop__modal-detail shop__modal-detail--full">
                        <strong>Pack Contains</strong>
                        <ul>${p.packContents.map(item => `<li>${item}</li>`).join('')}</ul>
                    </div>` : ''}
                </div>
                <a href="contact.html?product=${encodeURIComponent(p.name)}" class="btn btn--primary">Request a Quote</a>
            </div>
        `;

        // Gallery navigation
        const thumbs = body.querySelectorAll('.shop__modal-thumb');
        const mainImg = body.querySelector('.shop__modal-img-main');
        const counter = body.querySelector('.shop__modal-counter-current');
        const prevBtn = body.querySelector('.shop__modal-arrow--prev');
        const nextBtn = body.querySelector('.shop__modal-arrow--next');
        let activeIdx = 0;

        function setActive(idx) {
            if (!gallery.length) return;
            const next = ((idx % gallery.length) + gallery.length) % gallery.length;
            activeIdx = next;
            mainImg.src = gallery[next];
            if (counter) counter.textContent = String(next + 1);
            thumbs.forEach(t => {
                const active = parseInt(t.dataset.index, 10) === next;
                t.classList.toggle('is-active', active);
                t.setAttribute('aria-selected', active ? 'true' : 'false');
                if (active) t.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: 'smooth' });
            });
        }

        thumbs.forEach(btn => btn.addEventListener('click', () => {
            const idx = parseInt(btn.dataset.index, 10);
            if (Number.isFinite(idx)) setActive(idx);
        }));
        if (prevBtn) prevBtn.addEventListener('click', () => setActive(activeIdx - 1));
        if (nextBtn) nextBtn.addEventListener('click', () => setActive(activeIdx + 1));

        const onKey = (e) => {
            if (!modal.classList.contains('active')) return;
            if (e.key === 'ArrowLeft') { e.preventDefault(); setActive(activeIdx - 1); }
            else if (e.key === 'ArrowRight') { e.preventDefault(); setActive(activeIdx + 1); }
        };
        document.addEventListener('keydown', onKey);
        modal._galleryKeyHandler = onKey;

        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeModal() {
        const modal = document.getElementById('productModal');
        if (!modal) return;
        modal.classList.remove('active');
        document.body.style.overflow = '';
        if (modal._galleryKeyHandler) {
            document.removeEventListener('keydown', modal._galleryKeyHandler);
            modal._galleryKeyHandler = null;
        }
    }

    async function init() {
        let products;
        try {
            const res = await fetch('data/products.json');
            const data = await res.json();
            products = (data.products || [])
                .filter(p => Array.isArray(p.images) && p.images[0])
                .filter(p => !WHITE_BG_IDS.has(p.id));
        } catch (e) {
            return;
        }
        if (!products.length) return;

        // Index products for the modal
        products.forEach(p => productsById.set(p.id, p));

        // Render the products once...
        products.forEach(p => track.appendChild(buildItem(p)));
        // ...then duplicate so the CSS translateX(-50%) loops seamlessly
        products.forEach(p => track.appendChild(buildItem(p)));
    }

    init();
})();
