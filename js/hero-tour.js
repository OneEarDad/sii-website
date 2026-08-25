/* ============================================
   SII Medical — Homepage Hero Feature Tour
   The hero nipper video pauses on each feature,
   draws a leader line + caption, then resumes and
   loops (finishing on the SII logo end card).
   Annotations are mapped to the video's 16:9 content
   box so they stay aligned even though the video is
   letterboxed inside the hero.
   ============================================ */
(function () {
    'use strict';

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    // Desktop/tablet only — the labels need the side room around the video.
    if (window.innerWidth < 900) return;

    const hero = document.getElementById('hero');
    const video = document.getElementById('heroVideo');
    const overlay = document.getElementById('heroTour');
    if (!hero || !video || !overlay) return;

    const lines = document.getElementById('htLines');
    const lead = document.getElementById('htLead');
    const ring = document.getElementById('htRing');
    const dot = document.getElementById('htDot');
    const label = document.getElementById('htLabel');
    const lE = document.getElementById('htE');
    const lT = document.getElementById('htT');
    const lD = document.getElementById('htD');
    const dotsWrap = document.getElementById('htDots');

    const FEATURES = [
        { t: 7,  fx: 54, fy: 13, lx: 62, ly: 18, label: 'Super Sharp Blade',
          desc: 'Ensures a clean and low effort cut. Sharp instruments mean faster, efficient procedures.' },
        { t: 7,  fx: 51, fy: 48, lx: 26, ly: 51, label: 'Internal Spring',
          desc: 'Ensures consistent performance and tension, giving predictable and reliable functionality.' },
        { t: 15, fx: 57, fy: 82, lx: 62, ly: 73, label: 'Cushioned Silicone Handle',
          desc: 'Improves comfort & reduces weight and hand strain, as they absorb the shock wave from the cut action.' },
        { t: 19, fx: 54, fy: 58, lx: 29, ly: 54, label: 'Gamma Sterilization',
          desc: 'Gamma-sterilized and factory-sealed, ensuring a 5-year sterile shelf life, ready to open and use.' }
    ];
    const HOLD = 3400;

    const dots = FEATURES.map(function () {
        const d = document.createElement('span');
        d.className = 'hero-tour__dot';
        dotsWrap.appendChild(d);
        return d;
    });

    let idx = 0, state = 'playing', lastTime = 0, holdTimer = null, activeIdx = -1;

    /* The 16:9 content box of the (object-fit:contain) video, in hero coords. */
    function contentRect() {
        const r = video.getBoundingClientRect();
        const h = hero.getBoundingClientRect();
        const ar = 16 / 9;
        let cw, ch, cx, cy;
        if (r.width / r.height > ar) { ch = r.height; cw = ch * ar; cx = r.left + (r.width - cw) / 2; cy = r.top; }
        else { cw = r.width; ch = cw / ar; cx = r.left; cy = r.top + (r.height - ch) / 2; }
        return { x: cx - h.left, y: cy - h.top, w: cw, h: ch };
    }

    function draw(i) {
        const f = FEATURES[i], c = contentRect();
        const fxp = c.x + f.fx / 100 * c.w, fyp = c.y + f.fy / 100 * c.h;
        const lxp = c.x + f.lx / 100 * c.w, lyp = c.y + f.ly / 100 * c.h;

        lead.setAttribute('x1', fxp); lead.setAttribute('y1', fyp);
        lead.setAttribute('x2', lxp); lead.setAttribute('y2', lyp);
        ring.setAttribute('cx', fxp); ring.setAttribute('cy', fyp);
        dot.setAttribute('cx', fxp); dot.setAttribute('cy', fyp);
        lines.classList.add('on');

        // draw-on animation
        const len = Math.hypot(lxp - fxp, lyp - fyp);
        lead.style.transition = 'none';
        lead.setAttribute('stroke-dasharray', len);
        lead.setAttribute('stroke-dashoffset', len);
        void lead.getBoundingClientRect();
        lead.style.transition = 'stroke-dashoffset .6s cubic-bezier(.62,.16,.13,1.01)';
        lead.setAttribute('stroke-dashoffset', 0);

        lE.textContent = 'Feature 0' + (i + 1);
        lT.textContent = f.label;
        lD.textContent = f.desc;
        const right = f.lx >= f.fx;
        label.classList.toggle('right', right);
        label.classList.toggle('left', !right);
        label.style.top = lyp + 'px';
        if (right) { label.style.left = lxp + 'px'; label.style.right = 'auto'; }
        else { label.style.left = 'auto'; label.style.right = (hero.clientWidth - lxp) + 'px'; }
        label.classList.add('on');

        dots.forEach(function (d, j) { d.classList.toggle('active', j === i); d.classList.toggle('done', j < i); });
    }

    function pointAt(i) { activeIdx = i; draw(i); }
    function clearPoint() { activeIdx = -1; lines.classList.remove('on'); label.classList.remove('on'); }

    function pauseAt(i) {
        state = 'paused';
        video.pause();
        const onSeeked = function () { video.removeEventListener('seeked', onSeeked); pointAt(i); holdTimer = setTimeout(resume, HOLD); };
        video.addEventListener('seeked', onSeeked);
        video.currentTime = FEATURES[i].t;
    }
    function resume() { clearPoint(); idx++; video.play().catch(function () {}); state = 'playing'; }

    function loop() {
        const ct = video.currentTime;
        if (ct < lastTime - 1) { idx = 0; dots.forEach(function (d) { d.classList.remove('done', 'active'); }); }
        lastTime = ct;
        if (state === 'playing' && idx < FEATURES.length && ct >= FEATURES[idx].t) { pauseAt(idx); }
        requestAnimationFrame(loop);
    }

    // keep the annotation aligned if the layout shifts while a feature is up
    window.addEventListener('resize', function () { if (activeIdx >= 0) draw(activeIdx); });
    window.addEventListener('scroll', function () { if (activeIdx >= 0) draw(activeIdx); }, { passive: true });

    function begin() { requestAnimationFrame(loop); }
    if (video.readyState >= 2) begin();
    else video.addEventListener('loadeddata', begin, { once: true });
})();
