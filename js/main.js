/* ============================================
   SII Medical — Main JavaScript
   Shared nav, footer, scroll animations, utilities
   ============================================ */

(function () {
    'use strict';

    /* --- Navigation HTML --- */
    const navHTML = `
    <nav class="nav" id="nav">
        <div class="nav__inner">
            <a href="index.html" class="nav__logo" aria-label="SII Medical Home">
                <img src="SII Logo SVG.svg" alt="SII Medical Logo">
            </a>
            <div class="nav__links" id="navLinks">
                <a href="index.html">Home</a>
                <a href="about.html">About</a>
                <a href="why-single-use.html">Why Single-Use</a>
                <a href="shop.html">Shop</a>
                <a href="federal.html">Federal</a>
                <div class="nav__dropdown">
                    <button class="nav__dropdown-toggle" aria-expanded="false">Resources <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg></button>
                    <div class="nav__dropdown-menu">
                        <a href="videos.html">Videos</a>
                        <a href="blog.html">Blog</a>
                        <a href="faq.html">FAQ</a>
                    </div>
                </div>
                <a href="contact.html">Contact</a>
            </div>
            <a href="contact.html" class="btn btn--primary nav__cta">Request a Quote</a>
            <button class="nav__hamburger" id="hamburger" aria-label="Toggle menu" aria-expanded="false">
                <span></span>
                <span></span>
                <span></span>
            </button>
        </div>
        <div class="nav__mobile" id="mobileMenu">
            <a href="index.html">Home</a>
            <a href="about.html">About</a>
            <a href="why-single-use.html">Why Single-Use</a>
            <a href="shop.html">Shop</a>
            <a href="federal.html">Federal</a>
            <div class="nav__mobile-dropdown">
                <button class="nav__mobile-dropdown-toggle">Resources <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg></button>
                <div class="nav__mobile-dropdown-menu">
                    <a href="videos.html">Videos</a>
                    <a href="blog.html">Blog</a>
                    <a href="faq.html">FAQ</a>
                </div>
            </div>
            <a href="contact.html">Contact</a>
            <a href="contact.html" class="btn btn--primary">Request a Quote</a>
        </div>
    </nav>`;

    /* --- Footer HTML --- */
    const footerHTML = `
    <footer class="footer">
        <div class="container">
            <div class="footer__grid">
                <div class="footer__brand">
                    <img src="SII Logo SVG.svg" alt="SII Medical Logo">
                    <p>Committed to setting the standard in service excellence by delivering high-quality surgical instruments to the world's leading healthcare providers in their pursuit of superior patient care.</p>
                    <div class="footer__social">
                        <a href="https://www.linkedin.com/company/surgical-instruments-innovations/" target="_blank" rel="noopener" aria-label="LinkedIn">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                        </a>
                        <a href="https://www.facebook.com/SiiMedical" target="_blank" rel="noopener" aria-label="Facebook">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                        </a>
                    </div>
                </div>
                <div>
                    <h4 class="footer__heading">Quick Links</h4>
                    <div class="footer__links">
                        <a href="about.html">About Us</a>
                        <a href="why-single-use.html">Why Single-Use</a>
                        <a href="shop.html">Our Instruments</a>
                        <a href="federal.html">Federal Sales</a>
                        <a href="faq.html">FAQ</a>
                    </div>
                </div>
                <div>
                    <h4 class="footer__heading">Resources</h4>
                    <div class="footer__links">
                        <a href="videos.html">Videos</a>
                        <a href="blog.html">Blog & News</a>
                        <a href="contact.html">Contact Us</a>
                        <a href="contact.html">Request a Quote</a>
                    </div>
                </div>
                <div class="footer__contact">
                    <h4 class="footer__heading">Contact</h4>
                    <p>3901 W Van Buren St.<br>Suite 210/220<br>Phoenix, AZ 85009</p>
                    <p><a href="tel:6029620422">(602) 962-0422</a></p>
                    <p><a href="mailto:sales@siimedical.com">sales@siimedical.com</a></p>
                </div>
            </div>
            <div class="footer__bottom">
                <p>&copy; ${new Date().getFullYear()} Surgical Instruments &amp; Innovations. All rights reserved.</p>
                <p class="footer__tagline">Superior products. Superior outcomes.</p>
                <p>FDA Registration #1413711</p>
            </div>
        </div>
    </footer>`;

    /* --- Inject Components --- */
    function injectComponents() {
        // Nav
        const navTarget = document.getElementById('nav-placeholder');
        if (navTarget) {
            navTarget.outerHTML = navHTML;
        } else {
            document.body.insertAdjacentHTML('afterbegin', navHTML);
        }

        // Footer
        const footerTarget = document.getElementById('footer-placeholder');
        if (footerTarget) {
            footerTarget.outerHTML = footerHTML;
        } else {
            document.body.insertAdjacentHTML('beforeend', footerHTML);
        }
    }

    /* --- Set Active Nav Link --- */
    function setActiveNav() {
        const currentPage = window.location.pathname.split('/').pop() || 'index.html';
        const resourcePages = ['videos.html', 'blog.html', 'faq.html'];

        // Desktop & mobile direct links
        const allLinks = document.querySelectorAll('.nav__links > a, .nav__mobile > a');
        allLinks.forEach(link => {
            const href = link.getAttribute('href');
            if (href === currentPage) {
                link.classList.add('active');
            }
        });

        // Dropdown links
        const dropdownLinks = document.querySelectorAll('.nav__dropdown-menu a, .nav__mobile-dropdown-menu a');
        dropdownLinks.forEach(link => {
            const href = link.getAttribute('href');
            if (href === currentPage) {
                link.classList.add('active');
            }
        });

        // Mark desktop dropdown toggle as active if on a resource page
        if (resourcePages.includes(currentPage)) {
            const toggle = document.querySelector('.nav__dropdown-toggle');
            if (toggle) toggle.classList.add('active');
        }
    }

    /* --- Mobile Menu Toggle --- */
    function initMobileMenu() {
        const hamburger = document.getElementById('hamburger');
        const mobileMenu = document.getElementById('mobileMenu');
        if (!hamburger || !mobileMenu) return;

        hamburger.addEventListener('click', () => {
            const isOpen = mobileMenu.classList.toggle('open');
            hamburger.classList.toggle('open');
            hamburger.setAttribute('aria-expanded', isOpen);
            document.body.style.overflow = isOpen ? 'hidden' : '';
        });

        // Close on link click
        mobileMenu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                mobileMenu.classList.remove('open');
                hamburger.classList.remove('open');
                hamburger.setAttribute('aria-expanded', 'false');
                document.body.style.overflow = '';
            });
        });

        // Mobile Resources dropdown toggle
        const mobileDropdownToggle = mobileMenu.querySelector('.nav__mobile-dropdown-toggle');
        const mobileDropdown = mobileMenu.querySelector('.nav__mobile-dropdown');
        if (mobileDropdownToggle && mobileDropdown) {
            mobileDropdownToggle.addEventListener('click', () => {
                mobileDropdown.classList.toggle('open');
            });
        }
    }

    /* --- Navbar Scroll Shadow --- */
    function initNavScroll() {
        const nav = document.getElementById('nav');
        if (!nav) return;

        let ticking = false;
        window.addEventListener('scroll', () => {
            if (!ticking) {
                requestAnimationFrame(() => {
                    nav.classList.toggle('nav--scrolled', window.scrollY > 10);
                    ticking = false;
                });
                ticking = true;
            }
        });
    }

    /* --- Scroll Animations (IntersectionObserver) --- */
    function initScrollAnimations() {
        const elements = document.querySelectorAll('.animate, .animate--left, .animate--right, .animate--scale');
        if (!elements.length) return;

        // Respect reduced motion
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            elements.forEach(el => el.classList.add('in-view'));
            return;
        }

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('in-view');
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -40px 0px'
        });

        elements.forEach(el => observer.observe(el));
    }

    /* --- Counter Animation --- */
    function animateCounters() {
        const counters = document.querySelectorAll('[data-count]');
        if (!counters.length) return;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const el = entry.target;
                    const target = parseInt(el.getAttribute('data-count'), 10);
                    const suffix = el.getAttribute('data-suffix') || '';
                    const prefix = el.getAttribute('data-prefix') || '';
                    const duration = 1500;
                    const start = performance.now();

                    function update(now) {
                        const elapsed = now - start;
                        const progress = Math.min(elapsed / duration, 1);
                        // Ease out cubic
                        const eased = 1 - Math.pow(1 - progress, 3);
                        const current = Math.round(target * eased);
                        el.textContent = prefix + current + suffix;
                        if (progress < 1) {
                            requestAnimationFrame(update);
                        }
                    }

                    requestAnimationFrame(update);
                    observer.unobserve(el);
                }
            });
        }, { threshold: 0.5 });

        counters.forEach(el => observer.observe(el));
    }

    /* --- Initialize Everything --- */
    function init() {
        injectComponents();
        setActiveNav();
        initMobileMenu();
        initNavScroll();
        initScrollAnimations();
        animateCounters();
    }

    // Run on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
