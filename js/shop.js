/* ============================================
   SII Medical — Shop Page
   Product filtering, search, display, and
   featured procedure packs
   ============================================ */

(function () {
    'use strict';

    const shopContainer = document.getElementById('shop-container');
    if (!shopContainer) return;

    let allProducts = [];
    let categories = [];
    let specialties = [];
    let activeFilters = { category: '', specialty: '', search: '', channel: 'all' };

    // Curated featured product IDs — packs & kits only
    const featuredIds = ['BSDP-04F', 'BSDP-03F', 'BSDP-03-02F', 'SSP-132F', 'SSP-021F'];

    /* --- Global image error handler (avoids broken inline onerror) --- */
    window._shopImgError = function (img) {
        img.style.display = 'none';
        const placeholder = document.createElement('div');
        placeholder.className = 'shop__card-placeholder';
        placeholder.innerHTML = '<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--teal)" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z"/></svg>';
        img.parentElement.appendChild(placeholder);
    };

    /* --- Fetch Products --- */
    async function loadProducts() {
        try {
            const res = await fetch('data/products.json');
            const data = await res.json();
            allProducts = data.products;
            categories = data.categories;
            specialties = data.specialties;
            buildPage();
        } catch (err) {
            shopContainer.innerHTML = '<p style="text-align:center;color:var(--steel-gray);padding:var(--space-2xl);">Unable to load products. Please try again later.</p>';
        }
    }

    /* --- Build Full Page Structure --- */
    function buildPage() {
        // Get curated featured products by ID
        const featured = featuredIds
            .map(id => allProducts.find(p => p.id === id))
            .filter(Boolean);

        // Insert featured packs section BEFORE the catalog section
        const mainEl = document.querySelector('main');
        const catalogSection = shopContainer.closest('.section');

        // Create featured packs section
        const featuredSection = document.createElement('section');
        featuredSection.className = 'shop-featured';
        featuredSection.innerHTML = `
            <div class="container">
                <span class="shop-featured__label">Featured</span>
                <h2 class="shop-featured__title">Procedure Packs &amp; Kits</h2>
                <div class="shop-featured__grid" id="featuredGrid">
                    ${featured.map((p, i) => `
                        <div class="shop-featured__card animate stagger-${i + 1}" onclick="window._shopOpenModal('${p.id}')">
                            <div class="shop-featured__card-img">
                                ${p.isPack ? '<span class="shop-featured__card-badge">Pack</span>' : ''}
                                ${productImageHTML(p)}
                            </div>
                            <div class="shop-featured__card-body">
                                <h3 class="shop-featured__card-name">${p.name}</h3>
                                <p class="shop-featured__card-sku">${p.sku}</p>
                                <p class="shop-featured__card-desc">${p.description}</p>
                                ${p.packContents ? `
                                <div class="shop-featured__card-contents">
                                    ${p.packContents.map(item => `<span>${item}</span>`).join('')}
                                </div>` : ''}
                            </div>
                        </div>
                    `).join('')}
                </div>
                <div class="shop-featured__scrollbar" id="featuredScrollbar">
                    <div class="shop-featured__thumb" id="featuredThumb"></div>
                </div>
            </div>
        `;

        // Create divider
        const divider = document.createElement('div');
        divider.className = 'shop-divider';

        // Insert before catalog
        mainEl.insertBefore(featuredSection, catalogSection);
        mainEl.insertBefore(divider, catalogSection);

        // Add catalog class
        catalogSection.classList.add('shop-catalog');

        // Build catalog
        renderCatalog();

        // Observe featured cards for scroll animation
        observeElements(featuredSection.querySelectorAll('.animate'));

        // Wire up the mobile carousel dots
        setupFeaturedCarousel(featuredSection);
    }

    /* --- Featured carousel scrollbar ---
       A slim draggable scroll indicator under the row that reflects and drives
       the free-scroll position. Progressive — if anything's missing the row
       still scrolls on its own. */
    function setupFeaturedCarousel(section) {
        const track = section.querySelector('#featuredGrid');
        const bar = section.querySelector('#featuredScrollbar');
        const thumb = section.querySelector('#featuredThumb');
        if (!track || !bar || !thumb) return;
        if (track.children.length < 2) { bar.style.display = 'none'; return; }

        function update() {
            const maxScroll = track.scrollWidth - track.clientWidth;
            if (maxScroll <= 1) { bar.style.display = 'none'; return; }
            bar.style.display = '';
            const thumbPct = Math.max((track.clientWidth / track.scrollWidth) * 100, 14);
            thumb.style.width = thumbPct + '%';
            thumb.style.left = ((track.scrollLeft / maxScroll) * (100 - thumbPct)) + '%';
        }

        let ticking = false;
        track.addEventListener('scroll', () => {
            if (!ticking) { ticking = true; requestAnimationFrame(() => { update(); ticking = false; }); }
        }, { passive: true });
        window.addEventListener('resize', () => requestAnimationFrame(update));
        update();

        // Drag the thumb (or click the track) to scroll
        let dragging = false, grabDx = 0;
        const setScrollFromX = (clientX, useGrab) => {
            const rect = bar.getBoundingClientRect();
            const thumbW = thumb.offsetWidth;
            const offset = useGrab ? grabDx : thumbW / 2;
            const travel = rect.width - thumbW;
            const p = travel > 0 ? Math.min(Math.max((clientX - rect.left - offset) / travel, 0), 1) : 0;
            track.scrollLeft = p * (track.scrollWidth - track.clientWidth);
        };
        thumb.addEventListener('pointerdown', (e) => {
            dragging = true;
            grabDx = e.clientX - thumb.getBoundingClientRect().left;
            try { thumb.setPointerCapture(e.pointerId); } catch (_) {}
            e.preventDefault();
        });
        thumb.addEventListener('pointermove', (e) => { if (dragging) setScrollFromX(e.clientX, true); });
        const endDrag = (e) => { dragging = false; try { thumb.releasePointerCapture(e.pointerId); } catch (_) {} };
        thumb.addEventListener('pointerup', endDrag);
        thumb.addEventListener('pointercancel', endDrag);
        bar.addEventListener('pointerdown', (e) => { if (e.target === bar) setScrollFromX(e.clientX, false); });

        // --- Smooth mouse wheel: ease a vertical wheel into horizontal scroll ---
        let targetX = null, wheelRaf = null;
        const wheelStep = () => {
            const diff = targetX - track.scrollLeft;
            if (Math.abs(diff) < 0.5) { track.scrollLeft = targetX; targetX = null; wheelRaf = null; return; }
            track.scrollLeft += diff * 0.22;
            wheelRaf = requestAnimationFrame(wheelStep);
        };
        track.addEventListener('wheel', (e) => {
            const max = track.scrollWidth - track.clientWidth;
            if (max <= 1) return;
            const delta = Math.abs(e.deltaY) >= Math.abs(e.deltaX) ? e.deltaY : e.deltaX;
            if (!delta) return;
            // let the page scroll normally once the row is at either edge
            if ((delta < 0 && track.scrollLeft <= 0) || (delta > 0 && track.scrollLeft >= max - 1)) { targetX = null; return; }
            e.preventDefault();
            targetX = Math.max(0, Math.min((targetX == null ? track.scrollLeft : targetX) + delta, max));
            if (!wheelRaf) wheelRaf = requestAnimationFrame(wheelStep);
        }, { passive: false });

        // --- Grab & flick to scroll (mouse), with momentum; touch uses native ---
        // Listeners live on window (no pointer capture) so a plain click still
        // lands on the card and opens the modal; a real drag engages only after
        // the pointer moves past a small threshold.
        let down = false, startX = 0, startScroll = 0, lastX = 0, lastT = 0, vel = 0, moved = false, momRaf = null;
        track.addEventListener('pointerdown', (e) => {
            if (e.pointerType !== 'mouse' || e.button !== 0) return;
            down = true; moved = false;
            startX = lastX = e.clientX; startScroll = track.scrollLeft;
            lastT = performance.now(); vel = 0;
            if (momRaf) { cancelAnimationFrame(momRaf); momRaf = null; }
            if (wheelRaf) { cancelAnimationFrame(wheelRaf); wheelRaf = null; targetX = null; }
        });
        window.addEventListener('pointermove', (e) => {
            if (!down) return;
            const dx = e.clientX - startX;
            if (!moved && Math.abs(dx) > 4) { moved = true; track.classList.add('is-dragging'); }
            if (moved) track.scrollLeft = startScroll - dx;
            const now = performance.now(), dt = now - lastT;
            if (dt > 0) { vel = (e.clientX - lastX) / dt; lastX = e.clientX; lastT = now; }
        });
        window.addEventListener('pointerup', () => {
            if (!down) return;
            down = false;
            track.classList.remove('is-dragging');
            let v = vel * 16;                        // ~px per frame
            const momentum = () => {
                if (Math.abs(v) < 0.4) { momRaf = null; return; }
                track.scrollLeft -= v;
                v *= 0.93;                           // friction
                momRaf = requestAnimationFrame(momentum);
            };
            if (Math.abs(v) > 1) momRaf = requestAnimationFrame(momentum);
        });
        // Swallow the card's click only if the pointer was actually dragged
        track.addEventListener('click', (e) => { if (moved) { e.stopPropagation(); e.preventDefault(); moved = false; } }, true);
    }

    /* --- Render Catalog (sidebar + grid, ecommerce layout) --- */
    function renderCatalog() {
        const federalCount = allProducts.filter(p => p.federal).length;
        const commercialCount = allProducts.filter(p => !p.federal).length;

        const categoryCount = (cat) => allProducts.filter(p => p.category === cat).length;
        const specialtyCount = (sp) => allProducts.filter(p => p.specialties.includes(sp)).length;

        // Sidebar markup is shared by the desktop column and the mobile drawer
        const sidebarHTML = `
            <div class="shop-sidebar__section">
                <h3 class="shop-sidebar__heading">Browse</h3>
                <div class="shop-sidebar__channels">
                    <button class="shop-channel-btn is-active" data-channel="all">
                        <span>All Products</span>
                        <span class="shop-channel-btn__count">${allProducts.length}</span>
                    </button>
                    <button class="shop-channel-btn" data-channel="federal">
                        <span>Federal</span>
                        <span class="shop-channel-btn__count">${federalCount}</span>
                    </button>
                    <button class="shop-channel-btn" data-channel="commercial">
                        <span>Commercial</span>
                        <span class="shop-channel-btn__count">${commercialCount}</span>
                    </button>
                </div>
            </div>

            <div class="shop-sidebar__section">
                <h3 class="shop-sidebar__heading">Search</h3>
                <div class="shop-sidebar__search">
                    <svg class="shop-sidebar__search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                    <input type="text" id="shopSearch" class="shop-sidebar__search-input" placeholder="Name, SKU, or category" aria-label="Search products">
                </div>
            </div>

            <div class="shop-sidebar__section">
                <h3 class="shop-sidebar__heading">Category</h3>
                <ul class="shop-filter-list" id="categoryList">
                    <li><button class="shop-filter-item is-active" data-filter="category" data-value="">All <span class="shop-filter-item__count">${allProducts.length}</span></button></li>
                    ${categories.map(c => `<li><button class="shop-filter-item" data-filter="category" data-value="${c}">${c} <span class="shop-filter-item__count">${categoryCount(c)}</span></button></li>`).join('')}
                </ul>
            </div>

            <div class="shop-sidebar__section">
                <h3 class="shop-sidebar__heading">Specialty</h3>
                <ul class="shop-filter-list" id="specialtyList">
                    <li><button class="shop-filter-item is-active" data-filter="specialty" data-value="">All <span class="shop-filter-item__count">${allProducts.length}</span></button></li>
                    ${specialties.map(s => `<li><button class="shop-filter-item" data-filter="specialty" data-value="${s}">${s} <span class="shop-filter-item__count">${specialtyCount(s)}</span></button></li>`).join('')}
                </ul>
            </div>

            <button class="shop-clear-all" id="clearAllBtn" type="button">Clear all filters</button>
        `;

        shopContainer.innerHTML = `
            <div class="shop-layout">
                <aside class="shop-sidebar" id="shopSidebar" aria-label="Filter products">
                    ${sidebarHTML}
                </aside>

                <div class="shop-main">
                    <div class="shop-main__bar">
                        <div class="shop-main__count" id="shopCount">Loading…</div>
                        <button class="shop-mobile-filters" id="openFilters" type="button" aria-label="Open filters">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="4" y1="6" x2="20" y2="6"/><line x1="7" y1="12" x2="17" y2="12"/><line x1="10" y1="18" x2="14" y2="18"/></svg>
                            <span>Filters</span>
                            <span class="shop-mobile-filters__badge" id="filtersBadge" hidden>0</span>
                        </button>
                    </div>
                    <div class="shop__grid" id="shopGrid"></div>
                </div>
            </div>

            <!-- Mobile filter drawer (same controls as the desktop sidebar) -->
            <div class="shop-drawer" id="shopDrawer" hidden>
                <div class="shop-drawer__backdrop" id="drawerBackdrop"></div>
                <aside class="shop-drawer__panel" role="dialog" aria-label="Filters">
                    <div class="shop-drawer__head">
                        <strong>Filters</strong>
                        <button class="shop-drawer__close" id="closeFilters" type="button" aria-label="Close filters">&times;</button>
                    </div>
                    <div class="shop-drawer__body" id="drawerBody">
                        ${sidebarHTML.replace(/id="shopSearch"/, 'id="shopSearchMobile"')
                                     .replace(/id="categoryList"/, 'id="categoryListMobile"')
                                     .replace(/id="specialtyListMobile"/, 'id="specialtyListMobile"')
                                     .replace(/id="specialtyList"/, 'id="specialtyListMobile"')
                                     .replace(/id="clearAllBtn"/, 'id="clearAllBtnMobile"')}
                    </div>
                    <div class="shop-drawer__foot">
                        <button class="shop-drawer__apply" id="applyFilters" type="button">View results</button>
                    </div>
                </aside>
            </div>

            <!-- Product Modal -->
            <div class="modal-overlay" id="productModal">
                <div class="modal-content shop__modal">
                    <button class="shop__modal-close" id="modalClose" aria-label="Close">&times;</button>
                    <div class="shop__modal-body" id="modalBody"></div>
                </div>
            </div>
        `;

        bindCatalogEvents();
        renderProducts();
        syncFilterUI();
    }

    /* --- Event wiring for sidebar + drawer --- */
    function bindCatalogEvents() {
        // Channel buttons (desktop + drawer)
        document.querySelectorAll('.shop-channel-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                activeFilters.channel = btn.dataset.channel || 'all';
                syncFilterUI();
                renderProducts();
            });
        });

        // Filter list items (desktop + drawer)
        document.querySelectorAll('.shop-filter-item').forEach(btn => {
            btn.addEventListener('click', () => {
                const key = btn.dataset.filter;       // 'category' | 'specialty'
                const value = btn.dataset.value || '';
                activeFilters[key] = value;
                syncFilterUI();
                renderProducts();
            });
        });

        // Search inputs (desktop sidebar + drawer)
        const onInput = (e) => {
            activeFilters.search = e.target.value.toLowerCase();
            // Mirror to the other input so they stay in sync
            const sel = e.target.id === 'shopSearch' ? '#shopSearchMobile' : '#shopSearch';
            const other = document.querySelector(sel);
            if (other) other.value = e.target.value;
            renderProducts();
        };
        const s1 = document.getElementById('shopSearch');
        const s2 = document.getElementById('shopSearchMobile');
        if (s1) s1.addEventListener('input', onInput);
        if (s2) s2.addEventListener('input', onInput);

        // Clear all
        document.querySelectorAll('#clearAllBtn, #clearAllBtnMobile').forEach(btn => {
            btn.addEventListener('click', clearAllFilters);
        });

        // Mobile drawer open/close
        const drawer = document.getElementById('shopDrawer');
        const openBtn = document.getElementById('openFilters');
        const closeBtn = document.getElementById('closeFilters');
        const backdrop = document.getElementById('drawerBackdrop');
        const applyBtn = document.getElementById('applyFilters');
        const openDrawer = () => {
            drawer.hidden = false;
            requestAnimationFrame(() => drawer.classList.add('is-open'));
            document.body.style.overflow = 'hidden';
        };
        const closeDrawer = () => {
            drawer.classList.remove('is-open');
            document.body.style.overflow = '';
            setTimeout(() => { drawer.hidden = true; }, 280);
        };
        if (openBtn) openBtn.addEventListener('click', openDrawer);
        if (closeBtn) closeBtn.addEventListener('click', closeDrawer);
        if (backdrop) backdrop.addEventListener('click', closeDrawer);
        if (applyBtn) applyBtn.addEventListener('click', closeDrawer);

        // Modal events
        document.getElementById('modalClose').addEventListener('click', closeModal);
        document.getElementById('productModal').addEventListener('click', (e) => {
            if (e.target === e.currentTarget) closeModal();
        });
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                closeModal();
                if (drawer && !drawer.hidden) closeDrawer();
            }
        });
    }

    /* --- Reflect activeFilters state into the UI (both copies of sidebar) --- */
    function syncFilterUI() {
        document.querySelectorAll('.shop-channel-btn').forEach(btn => {
            btn.classList.toggle('is-active', btn.dataset.channel === activeFilters.channel);
        });
        document.querySelectorAll('.shop-filter-item').forEach(btn => {
            const key = btn.dataset.filter;
            const value = btn.dataset.value || '';
            btn.classList.toggle('is-active', activeFilters[key] === value);
        });
        // Update the mobile-trigger badge
        const badge = document.getElementById('filtersBadge');
        if (badge) {
            const count = [
                activeFilters.channel !== 'all',
                !!activeFilters.category,
                !!activeFilters.specialty,
                !!activeFilters.search,
            ].filter(Boolean).length;
            if (count > 0) { badge.textContent = String(count); badge.hidden = false; }
            else { badge.hidden = true; }
        }
    }

    /* --- Reset every filter and sync both copies of the sidebar --- */
    function clearAllFilters() {
        activeFilters = { category: '', specialty: '', search: '', channel: 'all' };
        const s1 = document.getElementById('shopSearch');
        const s2 = document.getElementById('shopSearchMobile');
        if (s1) s1.value = '';
        if (s2) s2.value = '';
        syncFilterUI();
        renderProducts();
    }

    /* --- (legacy hook kept for any inline onclick from older HTML) --- */
    function renderActiveFilters() {
        const el = document.getElementById('activeFilters');
        if (!el) return;
        const pills = [];

        el.innerHTML = pills.join('');
    }

    // Expose to global for inline onclick (legacy)
    window._shopClearAll = clearAllFilters;

    /* --- Product Image HTML --- */
    function primaryImage(p) {
        return (Array.isArray(p.images) && p.images[0]) || p.image;
    }

    function productImageHTML(p) {
        const main = primaryImage(p);
        const hover = Array.isArray(p.images) && p.images[1] ? p.images[1] : null;
        return `
            <img class="shop__card-img-main" src="${main}" alt="${p.name}" loading="lazy" onerror="window._shopImgError(this)">
            ${hover ? `<img class="shop__card-img-hover" src="${hover}" alt="" aria-hidden="true" loading="lazy" onerror="this.remove()">` : ''}
        `;
    }

    /* --- Render Product Grid --- */
    function renderProducts() {
        const grid = document.getElementById('shopGrid');
        const countEl = document.getElementById('shopCount');

        const filtered = allProducts.filter(p => {
            const matchChannel = activeFilters.channel === 'all' ||
                (activeFilters.channel === 'federal' && p.federal) ||
                (activeFilters.channel === 'commercial' && !p.federal);
            const matchCategory = !activeFilters.category || p.category === activeFilters.category;
            const matchSpecialty = !activeFilters.specialty || p.specialties.includes(activeFilters.specialty);
            const matchSearch = !activeFilters.search ||
                p.name.toLowerCase().includes(activeFilters.search) ||
                p.sku.toLowerCase().includes(activeFilters.search) ||
                p.category.toLowerCase().includes(activeFilters.search);
            return matchChannel && matchCategory && matchSpecialty && matchSearch;
        });

        countEl.textContent = `Showing ${filtered.length} of ${allProducts.length} instruments`;

        if (!filtered.length) {
            grid.innerHTML = `
                <div class="shop__empty">
                    <p>No instruments match your filters.</p>
                    <button class="btn btn--secondary" onclick="window._shopClearAll()">Clear Filters</button>
                </div>`;
            return;
        }

        grid.innerHTML = filtered.map((p, i) => `
            <div class="shop__card animate stagger-${(i % 6) + 1}" data-id="${p.id}" onclick="window._shopOpenModal('${p.id}')">
                <div class="shop__card-img">
                    ${p.isPack ? '<span class="shop__card-badge">Pack</span>' : ''}
                    ${p.federal ? '<span class="shop__card-federal">TAA/BAA</span>' : ''}
                    ${productImageHTML(p)}
                </div>
                <div class="shop__card-body">
                    <span class="shop__card-category">${p.category}</span>
                    <h3 class="shop__card-name">${p.name}</h3>
                    ${p.size ? `<p class="shop__card-size">${p.size}</p>` : ''}
                    <p class="shop__card-sku">${p.sku}</p>
                </div>
            </div>
        `).join('');

        // Trigger scroll animations
        observeElements(grid.querySelectorAll('.animate'));
    }

    /* --- IntersectionObserver Helper --- */
    function observeElements(elements) {
        if (typeof IntersectionObserver === 'undefined') return;
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('in-view');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.08 });
        elements.forEach(el => observer.observe(el));
    }

    /* --- Product Modal --- */
    function openModal(productId) {
        const p = allProducts.find(prod => prod.id === productId);
        if (!p) return;

        const modal = document.getElementById('productModal');
        const body = document.getElementById('modalBody');

        const gallery = (Array.isArray(p.images) && p.images.length) ? p.images : [p.image].filter(Boolean);

        const hasMulti = gallery.length > 1;
        const arrowSvg = (dir) => `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="${dir === 'prev' ? '15 18 9 12 15 6' : '9 18 15 12 9 6'}"/></svg>`;

        body.innerHTML = `
            <div class="shop__modal-gallery" data-active="0">
                <div class="shop__modal-img">
                    <img class="shop__modal-img-main" src="${gallery[0]}" alt="${p.name}" onerror="window._shopImgError(this)">
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

        // Gallery navigation: thumbnails + prev/next arrows + keyboard
        const thumbs = body.querySelectorAll('.shop__modal-thumb');
        const mainImg = body.querySelector('.shop__modal-img-main');
        const counter = body.querySelector('.shop__modal-counter-current');
        const prevBtn = body.querySelector('.shop__modal-arrow--prev');
        const nextBtn = body.querySelector('.shop__modal-arrow--next');
        let activeIdx = 0;

        function setActive(idx) {
            if (!gallery.length) return;
            // wrap-around so arrows always navigate
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

        thumbs.forEach(btn => {
            btn.addEventListener('click', () => {
                const idx = parseInt(btn.dataset.index, 10);
                if (Number.isFinite(idx)) setActive(idx);
            });
        });
        if (prevBtn) prevBtn.addEventListener('click', () => setActive(activeIdx - 1));
        if (nextBtn) nextBtn.addEventListener('click', () => setActive(activeIdx + 1));

        // Keyboard navigation while the modal is open
        const onKey = (e) => {
            if (!modal.classList.contains('active')) return;
            if (e.key === 'ArrowLeft') { e.preventDefault(); setActive(activeIdx - 1); }
            else if (e.key === 'ArrowRight') { e.preventDefault(); setActive(activeIdx + 1); }
        };
        document.addEventListener('keydown', onKey);
        // Stash on the modal so closeModal can clean up
        modal._galleryKeyHandler = onKey;

        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeModal() {
        const modal = document.getElementById('productModal');
        if (modal) {
            modal.classList.remove('active');
            document.body.style.overflow = '';
            if (modal._galleryKeyHandler) {
                document.removeEventListener('keydown', modal._galleryKeyHandler);
                modal._galleryKeyHandler = null;
            }
        }
    }

    window._shopOpenModal = openModal;

    /* --- Init --- */
    loadProducts();
})();
