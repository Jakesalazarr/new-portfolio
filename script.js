/* script.js — behaviour for jacob-salazar.com ("Overlap").
   Depends on time.js (window.JSTime) and, when present, GSAP 3.13 with
   ScrollTrigger and SplitText, plus Lenis. Everything degrades: without the
   libraries the page is still complete, still lit by the sun, still ticking. */
(function () {
    'use strict';

    var T = window.JSTime;
    if (!T) return;

    var root = document.documentElement;
    var q = function (s, el) { return (el || document).querySelector(s); };
    var qa = function (s, el) { return Array.prototype.slice.call((el || document).querySelectorAll(s)); };
    var mq = function (s) { try { return window.matchMedia(s).matches; } catch (e) { return false; } };

    var reduce = mq('(prefers-reduced-motion: reduce)');
    var fine = mq('(pointer: fine)');
    var hoverable = mq('(hover: hover)');
    var saveData = !!(navigator.connection && navigator.connection.saveData);
    var hasGsap = !!(window.gsap && window.ScrollTrigger);
    if (hasGsap) {
        gsap.registerPlugin(ScrollTrigger);
        if (window.SplitText) gsap.registerPlugin(SplitText);
    }

    var CITY_KEYS = ['mnl', 'lax', 'syd'];
    var strip = q('#strip');
    var lanesEl = q('#lanes');
    var playheadLine = q('#playhead-line');
    var playheadLabel = q('.playhead-label', playheadLine);
    var playheadInput = q('#playhead');
    var pinNote = q('#pin-note');
    var pinText = q('#pin-text');
    var pinClear = q('#pin-clear');
    var sentenceEl = q('#sentence');
    var hero = q('.hero');

    /* ------------------------------------------------------------------ words */
    var WORDS = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen', 'twenty', 'twenty-one', 'twenty-two', 'twenty-three', 'twenty-four'];
    function hoursWord(n) {
        n = Math.max(0, Math.round(n));
        if (n === 1) return 'one hour';
        return (WORDS[n] || String(n)) + ' hours';
    }
    function clause(cityKey, st) {
        var name = T.CITIES[cityKey].name;
        if (st.state === 'working') return name + ' is at work';
        if (st.state === 'before') return st.hours < 0.5 ? name + ' is about to start' : name + ' starts in ' + hoursWord(st.hours);
        return st.hours < 0.5 ? name + ' has just closed' : name + ' closed ' + hoursWord(st.hours) + ' ago';
    }
    function sentence(date, cityKey) {
        var key = cityKey || 'mnl';
        var p = T.parts(date, T.CITIES[key].tz);
        if (key === 'mnl') {
            var la = T.workState(date, 'lax');
            var sy = T.workState(date, 'syd');
            if (p.hour < T.WORK_START && la.state === 'working') {
                return p.hhmm + ' in Manila. At this hour, from 2023 to 2025, I was working for Los Angeles.';
            }
            return p.hhmm + ' on ' + p.weekday + ' in Manila. ' + clause('lax', la) + ', ' + clause('syd', sy) + '.';
        }
        var st = T.workState(date, key);
        var tail;
        if (st.state === 'before') tail = st.hours < 0.5 ? 'their day is about to start' : hoursWord(st.hours) + ' before their day starts';
        else if (st.state === 'working') tail = st.hours < 0.5 ? 'at the start of their day' : hoursWord(st.hours) + ' into their day';
        else tail = st.hours < 0.5 ? 'their day has just ended' : hoursWord(st.hours) + ' after their day ended';
        return p.hhmm + ' on ' + p.weekday + ' in ' + T.CITIES[key].name + ', ' + tail + '.';
    }

    /* ------------------------------------------------------------------ the day on the strip */
    var dayStart = null;     // ms of Manila midnight for the displayed day
    var dayKey = '';
    function segmentsFor(startMin, endMin) {
        var s = ((startMin % 1440) + 1440) % 1440;
        var e = ((endMin % 1440) + 1440) % 1440;
        if (Math.abs(endMin - startMin) >= 1440) return [[0, 1440]];
        if (e > s) return [[s, e]];
        return [[s, 1440], [0, e]];
    }
    function placeBands(track, cls, segs) {
        var bands = qa('.' + cls, track);
        bands.forEach(function (b, i) {
            var seg = segs[i];
            if (!seg) { b.style.setProperty('--w', '0%'); return; }
            b.style.setProperty('--l', (seg[0] / 14.4).toFixed(3) + '%');
            b.style.setProperty('--w', ((seg[1] - seg[0]) / 14.4).toFixed(3) + '%');
        });
    }
    function buildDay(date) {
        var p = T.parts(date, T.CITIES.mnl.tz);
        var key = p.year + '-' + p.month + '-' + p.day;
        if (key === dayKey) return;
        dayKey = key;
        dayStart = T.manilaDayStart(date);
        CITY_KEYS.forEach(function (c) {
            var city = T.CITIES[c];
            var lane = q('.lane[data-city="' + c + '"]');
            if (!lane) return;
            var track = q('.lane-track', lane);
            var ev = T.sunEvents(date, c);
            placeBands(track, 'band--day', segmentsFor(T.toManilaMinute(ev.sunrise, dayStart), T.toManilaMinute(ev.sunset, dayStart)));
            var lp = T.parts(date, city.tz);
            var off = T.offsetMinutes(date, city.tz);
            var workStart = new Date(Date.UTC(lp.year, lp.month - 1, lp.day, T.WORK_START) - off * 60000);
            var workEnd = new Date(Date.UTC(lp.year, lp.month - 1, lp.day, T.WORK_END) - off * 60000);
            placeBands(track, 'band--work', segmentsFor(T.toManilaMinute(workStart, dayStart), T.toManilaMinute(workEnd, dayStart)));
        });
        buildArcTimes(date);
    }

    /* ------------------------------------------------------------------ rendering one instant */
    var hoverCity = null;
    var dragging = false;
    var lastSentence = '';
    var displayed = T.current();

    function renderTime(instant, scrubbing) {
        displayed = instant;
        root.classList.toggle('is-scrubbing', !!scrubbing);
        T.paint(root, instant);
        buildDay(instant);
        qa('[data-tz]').forEach(function (el) {
            var p = T.parts(instant, el.getAttribute('data-tz'));
            if (el.textContent !== p.hhmm) el.textContent = p.hhmm;
            if (el.hasAttribute('data-clock')) el.setAttribute('datetime', p.hhmm);
        });
        CITY_KEYS.forEach(function (c) {
            var off = T.isOffHours(instant, c);
            qa('[data-city="' + c + '"]').forEach(function (el) { el.classList.toggle('is-off', off); });
            var st = q('.clock[data-city="' + c + '"] .clock-state');
            if (st) st.textContent = off ? ', outside working hours' : '';
        });
        var minute = T.toManilaMinute(instant, dayStart);
        var ph = minute / 1440;
        if (lanesEl) lanesEl.style.setProperty('--ph', ph.toFixed(4));
        var hhmm = T.parts(instant, T.CITIES.mnl.tz).hhmm;
        if (playheadLabel) playheadLabel.textContent = hhmm;
        if (playheadLine) playheadLine.classList.toggle('is-right', ph > 0.86);
        if (playheadInput) {
            if (!dragging) playheadInput.value = String(Math.round(minute));
            playheadInput.setAttribute('aria-valuetext', hhmm);
        }
        var s = sentence(instant, hoverCity);
        if (s !== lastSentence && sentenceEl) { sentenceEl.textContent = s; lastSentence = s; }
        updateArcSun(instant);
    }

    /* ------------------------------------------------------------------ live ticking */
    var sweeping = false;
    function tick() {
        if (!sweeping && !dragging && !T.state.preview) renderTime(T.state.pinned || T.now(), false);
        updateVisitor();
    }
    function schedule() {
        var delay = 60000 - (Date.now() % 60000) + 50;
        setTimeout(function () { tick(); schedule(); }, delay);
    }
    document.addEventListener('visibilitychange', function () { if (document.visibilityState === 'visible') tick(); });

    /* ------------------------------------------------------------------ the playhead */
    function showPin(instant) {
        if (!pinNote) return;
        pinText.textContent = 'pinned ' + T.parts(instant, T.CITIES.mnl.tz).hhmm;
        pinNote.hidden = false;
    }
    function clearPin() {
        T.state.pinned = null;
        T.state.preview = null;
        if (pinNote) pinNote.hidden = true;
        try { history.replaceState(null, '', location.pathname); } catch (e) { /* file:// or sandboxed */ }
        renderTime(T.now(), false);
    }
    if (playheadInput) {
        playheadInput.addEventListener('input', function () {
            dragging = true;
            T.state.preview = T.atManilaMinute(T.state.pinned || T.now(), +playheadInput.value);
            renderTime(T.state.preview, true);
        });
        playheadInput.addEventListener('change', function () {
            dragging = false;
            var minute = +playheadInput.value;
            var nowMinute = Math.round(T.manilaMinute(T.now()));
            T.state.preview = null;
            if (Math.abs(minute - nowMinute) <= 1) { clearPin(); return; }
            T.state.pinned = T.atManilaMinute(T.now(), minute);
            try { history.replaceState(null, '', location.pathname + '?at=' + T.parts(T.state.pinned, T.CITIES.mnl.tz).hhmm); } catch (e) { /* ignore */ }
            showPin(T.state.pinned);
            renderTime(T.state.pinned, false);
        });
        playheadInput.addEventListener('keydown', function (e) {
            if (!e.shiftKey) return;
            var step = e.key === 'ArrowRight' || e.key === 'ArrowUp' ? 60 : e.key === 'ArrowLeft' || e.key === 'ArrowDown' ? -60 : 0;
            if (!step) return;
            e.preventDefault();
            playheadInput.value = String(Math.max(0, Math.min(1439, +playheadInput.value + step)));
            playheadInput.dispatchEvent(new Event('input'));
            playheadInput.dispatchEvent(new Event('change'));
        });
    }
    if (pinClear) pinClear.addEventListener('click', function (e) { e.preventDefault(); clearPin(); });
    if (T.state.pinned) showPin(T.state.pinned);

    /* ------------------------------------------------------------------ lanes and clocks: hover */
    qa('.lane-name').forEach(function (btn) {
        var city = btn.getAttribute('data-city');
        var lane = btn.closest('.lane');
        function on() { hoverCity = city; lane.classList.add('is-hot'); renderSentenceOnly(); }
        function off() { hoverCity = null; lane.classList.remove('is-hot'); renderSentenceOnly(); }
        btn.addEventListener('pointerenter', on);
        btn.addEventListener('pointerleave', off);
        btn.addEventListener('focus', on);
        btn.addEventListener('blur', off);
        btn.addEventListener('click', function () { if (hoverCity === city) off(); else on(); });
    });
    function renderSentenceOnly() {
        var s = sentence(displayed, hoverCity);
        if (s !== lastSentence && sentenceEl) { sentenceEl.textContent = s; lastSentence = s; }
    }
    function fmtOffset(min) {
        var sign = min < 0 ? '−' : '+';
        var abs = Math.abs(min);
        return 'UTC' + sign + Math.floor(abs / 60) + (abs % 60 ? ':' + T.pad(abs % 60) : '');
    }
    qa('.clock').forEach(function (clock) {
        var city = clock.getAttribute('data-city');
        var sun = q('.clock-sun', clock);
        function on() {
            var tz = T.CITIES[city].tz;
            var ev = T.sunEvents(displayed, city);
            sun.textContent = fmtOffset(T.offsetMinutes(displayed, tz)) + ' · sunrise ' + T.parts(ev.sunrise, tz).hhmm + ' · sunset ' + T.parts(ev.sunset, tz).hhmm;
            clock.classList.add('is-hover');
        }
        function off() { clock.classList.remove('is-hover'); }
        clock.addEventListener('pointerenter', on);
        clock.addEventListener('pointerleave', off);
    });

    /* ------------------------------------------------------------------ the solar arc (About) */
    var arc = q('#arc'), arcPath = q('#arc-path'), arcSun = q('#arc-sun'), arcTip = q('#arc-tip');
    var arcRise = q('#arc-rise'), arcNoon = q('#arc-noon'), arcSet = q('#arc-set');
    var arcEvents = null;
    var P0 = [16, 100], P1 = [160, -44], P2 = [304, 100];
    function arcPoint(t) {
        var u = 1 - t;
        return [u * u * P0[0] + 2 * u * t * P1[0] + t * t * P2[0], u * u * P0[1] + 2 * u * t * P1[1] + t * t * P2[1]];
    }
    function buildArcTimes(date) {
        arcEvents = T.sunEvents(date, 'mnl');
        var tz = T.CITIES.mnl.tz;
        if (arcRise) arcRise.textContent = T.parts(arcEvents.sunrise, tz).hhmm;
        if (arcNoon) arcNoon.textContent = T.parts(arcEvents.noon, tz).hhmm;
        if (arcSet) arcSet.textContent = T.parts(arcEvents.sunset, tz).hhmm;
    }
    function arcFraction(instant) {
        if (!arcEvents) return null;
        var a = arcEvents.sunrise.getTime(), b = arcEvents.sunset.getTime();
        var f = (instant.getTime() - a) / (b - a);
        return f;
    }
    function updateArcSun(instant) {
        if (!arc || !arcSun) return;
        var f = arcFraction(instant);
        if (f === null) return;
        var night = f < 0 || f > 1;
        arc.classList.toggle('is-night', night);
        if (!night) {
            var pt = arcPoint(f);
            arcSun.setAttribute('cx', pt[0].toFixed(1));
            arcSun.setAttribute('cy', pt[1].toFixed(1));
        }
        if (arcTip && !arcHovering) {
            var alt = T.altitude(instant, T.CITIES.mnl.lat, T.CITIES.mnl.lon);
            arcTip.textContent = (night ? 'Sun below the horizon, ' : 'Sun at ') + Math.abs(Math.round(alt)) + '°' + (night ? ' down' : '') + ' at ' + T.parts(instant, T.CITIES.mnl.tz).hhmm;
        }
    }
    var arcHovering = false;
    if (arc && fine) {
        var svg = q('.arc-svg', arc);
        svg.addEventListener('pointermove', function (e) {
            if (!arcEvents) return;
            var r = svg.getBoundingClientRect();
            var f = Math.max(0, Math.min(1, (e.clientX - r.left) / r.width));
            var instant = new Date(arcEvents.sunrise.getTime() + f * (arcEvents.sunset.getTime() - arcEvents.sunrise.getTime()));
            arcHovering = true;
            T.state.preview = instant;
            renderTime(instant, false);
            var alt = T.altitude(instant, T.CITIES.mnl.lat, T.CITIES.mnl.lon);
            arcTip.textContent = T.parts(instant, T.CITIES.mnl.tz).hhmm + ' · sun at ' + Math.round(alt) + '°';
        });
        svg.addEventListener('pointerleave', function () {
            arcHovering = false;
            T.state.preview = null;
            renderTime(T.state.pinned || T.now(), false);
        });
    }

    /* ------------------------------------------------------------------ years axis (Experience) */
    var yearsEl = q('#years');
    var roleEls = qa('.role');
    function monthIndex(ym) { var m = /(\d{4})-(\d{2})/.exec(ym); return m ? (+m[1] - 2018) * 12 + (+m[2] - 1) : null; }
    if (yearsEl && roleEls.length) {
        var nowP = T.parts(T.now(), T.CITIES.mnl.tz);
        var lastYear = Math.max(2026, nowP.year);
        var totalMonths = (lastYear - 2018 + 1) * 12;
        var axis = document.createElement('div');
        axis.className = 'years-axis';
        for (var y = 2018; y <= lastYear + 1; y++) {
            var tickEl = document.createElement('span');
            tickEl.className = 'year-tick' + (y === 2018 ? ' is-first' : y === lastYear + 1 ? ' is-last' : '');
            tickEl.style.setProperty('--x', ((y - 2018) * 12 / totalMonths * 100).toFixed(2) + '%');
            tickEl.textContent = String(y);
            axis.appendChild(tickEl);
        }
        yearsEl.appendChild(axis);
        roleEls.forEach(function (role) {
            var times = qa('time', role);
            var start = monthIndex(times[0].getAttribute('datetime'));
            var end = times[1] ? monthIndex(times[1].getAttribute('datetime')) + 1 : (nowP.year - 2018) * 12 + nowP.month;
            var open = !times[1];
            var row = document.createElement('div');
            row.className = 'year-row';
            row.setAttribute('data-role', role.getAttribute('data-role'));
            if (role.hasAttribute('data-side')) row.setAttribute('data-side', '');
            var l = start / totalMonths * 100, w = (end - start) / totalMonths * 100;
            row.style.setProperty('--l', l.toFixed(2) + '%');
            row.style.setProperty('--w', w.toFixed(2) + '%');
            var bar = document.createElement('span');
            bar.className = 'year-bar' + (open ? ' is-open' : '');
            row.appendChild(bar);
            var label = document.createElement('span');
            label.className = 'year-label' + (l + w > 72 ? ' year-label--left' : '');
            var org = q('.role-org', role);
            label.textContent = (q('.role-title', role).textContent.trim() === 'Hidden Tiny Verse' ? 'Hidden Tiny Verse' : (org ? org.textContent.trim().split(',')[0] : ''));
            row.appendChild(label);
            var hours = document.createElement('span');
            hours.className = 'year-hours';
            var cityKey = role.getAttribute('data-city');
            var tz = cityKey === 'sin' ? 'Asia/Singapore' : T.CITIES[cityKey] ? T.CITIES[cityKey].tz : T.CITIES.mnl.tz;
            var off = T.offsetMinutes(T.now(), tz);
            var startM = ((T.WORK_START * 60 - off + 480) % 1440 + 1440) % 1440;
            var endM = ((T.WORK_END * 60 - off + 480) % 1440 + 1440) % 1440;
            for (var h = 0; h < 24; h++) {
                var cell = document.createElement('span');
                var m = h * 60 + 30;
                var on = endM > startM ? (m >= startM && m < endM) : (m >= startM || m < endM);
                if (on) cell.className = 'on';
                hours.appendChild(cell);
            }
            row.appendChild(hours);
            var hl = document.createElement('span');
            hl.className = 'year-hours-label' + (l + w > 72 ? ' year-label--left' : '');
            hl.textContent = role.getAttribute('data-hours') || '';
            row.appendChild(hl);
            yearsEl.appendChild(row);
            function hot(onoff) {
                row.classList.toggle('is-hot', onoff);
                role.classList.toggle('is-hot', onoff);
                var lane = q('.lane[data-city="' + (cityKey === 'sin' ? 'mnl' : cityKey) + '"]');
                if (lane) lane.classList.toggle('is-echo', onoff);
            }
            [role, row].forEach(function (el) {
                el.addEventListener('pointerenter', function () { hot(true); });
                el.addEventListener('pointerleave', function () { hot(false); });
            });
            role.addEventListener('focusin', function () { hot(true); });
            role.addEventListener('focusout', function () { hot(false); });
        });
    }

    /* ------------------------------------------------------------------ frames: timecode and lens */
    function pad2(n) { return (n < 10 ? '0' : '') + n; }
    qa('.work').forEach(function (work) {
        var tc = q('.frame-tc', work);
        var idle = tc && tc.getAttribute('data-idle');
        if (tc && idle) tc.textContent = idle;
        var start = 0, raf = 0, elapsed = 0;
        function frame() {
            elapsed = (performance.now() - start) / 1000;
            var s = Math.floor(elapsed);
            tc.textContent = pad2(Math.floor(s / 3600)) + ':' + pad2(Math.floor(s / 60) % 60) + ':' + pad2(s % 60);
            raf = requestAnimationFrame(frame);
        }
        function on() {
            if (!tc || raf) return;
            work.classList.add('is-recording');
            start = performance.now() - elapsed * 1000;
            raf = requestAnimationFrame(frame);
        }
        function off() {
            work.classList.remove('is-recording');
            if (raf) { cancelAnimationFrame(raf); raf = 0; }
        }
        work.addEventListener('pointerenter', on);
        work.addEventListener('pointerleave', off);
        work.addEventListener('focusin', on);
        work.addEventListener('focusout', off);
    });
    var lens = q('#lens');
    var lensWork = q('.work[data-lens]');
    if (lens && lensWork && fine && hoverable) {
        var screen = q('.frame-screen', lensWork);
        var img = q('img', screen);
        lens.style.backgroundImage = 'url("' + img.getAttribute('src') + '")';
        screen.addEventListener('pointerenter', function () { lens.classList.add('is-on'); });
        screen.addEventListener('pointerleave', function () { lens.classList.remove('is-on'); });
        screen.addEventListener('pointermove', function (e) {
            var r = screen.getBoundingClientRect();
            var fx = (e.clientX - r.left) / r.width, fy = (e.clientY - r.top) / r.height;
            lens.style.left = e.clientX + 'px';
            lens.style.top = e.clientY + 'px';
            lens.style.backgroundPosition = (fx * 100).toFixed(2) + '% ' + (fy * 100).toFixed(2) + '%';
        });
    }

    /* ------------------------------------------------------------------ masthead: the page clock */
    var rec = q('#rec'), recElapsed = q('#rec-elapsed');
    if (rec && recElapsed) {
        var recStart = performance.now(), recPaused = false, recFrozen = 0;
        setInterval(function () {
            if (recPaused) return;
            var s = Math.floor((performance.now() - recStart) / 1000);
            recElapsed.textContent = pad2(Math.floor(s / 3600)) + ':' + pad2(Math.floor(s / 60) % 60) + ':' + pad2(s % 60);
        }, 1000);
        rec.addEventListener('click', function () {
            recPaused = !recPaused;
            rec.setAttribute('aria-pressed', recPaused ? 'true' : 'false');
            if (recPaused) recFrozen = performance.now(); else recStart += performance.now() - recFrozen;
        });
        rec.setAttribute('title', 'Rendered at ' + T.parts(T.now(), T.CITIES.mnl.tz).hhmm + ' Manila. Click to pause the page clock.');
    }

    /* ------------------------------------------------------------------ contact: the visitor's clock */
    var visitorEl = q('#visitor');
    function updateVisitor() {
        if (!visitorEl) return;
        var tz;
        try { tz = Intl.DateTimeFormat().resolvedOptions().timeZone; } catch (e) { tz = null; }
        var now = T.now();
        var mnl = T.parts(now, T.CITIES.mnl.tz);
        var st = T.workState(now, 'mnl');
        var tail = st.state === 'working' ? 'Manila is at work now.' : st.state === 'before' ? 'Manila’s working hours start in ' + hoursWord(st.hours) + '.' : 'Manila’s working hours ended ' + hoursWord(st.hours) + ' ago.';
        if (!tz || tz === T.CITIES.mnl.tz) { visitorEl.textContent = 'It is ' + mnl.hhmm + ' in Manila. ' + tail; return; }
        var you = T.parts(now, tz);
        visitorEl.textContent = 'It is ' + you.hhmm + ' where you are, ' + mnl.hhmm + ' in Manila. ' + tail;
    }

    /* ------------------------------------------------------------------ colophon: served from */
    var edge = q('#edge');
    if (edge && location.protocol.indexOf('http') === 0) {
        fetch('/cdn-cgi/trace', { cache: 'no-store' }).then(function (r) { return r.ok ? r.text() : ''; }).then(function (txt) {
            var m = /(^|\n)colo=([A-Z]{3})/.exec(txt || '');
            if (m) { edge.textContent = 'This copy was served from Cloudflare’s ' + m[2] + ' edge.'; edge.hidden = false; }
        }).catch(function () { /* silently absent */ });
    }

    /* ------------------------------------------------------------------ printing */
    var roleDetails = qa('.role details');
    window.addEventListener('beforeprint', function () {
        roleDetails.forEach(function (d) { d.dataset.wasOpen = d.open ? '1' : ''; d.open = true; });
    });
    window.addEventListener('afterprint', function () {
        roleDetails.forEach(function (d) { d.open = d.dataset.wasOpen === '1'; });
    });

    /* ------------------------------------------------------------------ first render */
    buildDay(T.current());
    renderTime(T.current(), false);
    updateVisitor();
    schedule();

    /* ------------------------------------------------------------------ motion */
    var stripHeight = function () { return strip ? strip.getBoundingClientRect().height : 0; };
    var sweep = { p: 0 };
    function applySweep(p) {
        var s = Math.min(p / 0.85, 1);
        var base = T.state.pinned || T.now();
        if (s >= 1) { sweeping = false; renderTime(base, false); return; }
        sweeping = s > 0;
        renderTime(new Date(base.getTime() + s * 86400000), true);
    }

    if (!hasGsap) {
        // No library: dock the strip by a plain scroll listener and stop there.
        var onScroll = function () {
            var r = hero.getBoundingClientRect();
            var d = r.bottom < window.innerHeight * 0.6 ? 1 : 0;
            strip.style.setProperty('--dock', d);
            strip.classList.toggle('is-docked', d === 1);
        };
        window.addEventListener('scroll', onScroll, { passive: true });
        onScroll();
        return;
    }

    var lenis = null;
    if (window.Lenis && fine && !reduce) {
        lenis = new Lenis({ lerp: 0.1, anchors: true });
        lenis.on('scroll', ScrollTrigger.update);
        gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
        gsap.ticker.lagSmoothing(0);
    }

    // The first scroll runs one whole day (desktop, pinned); on touch the day runs once after load.
    var pinST = null;
    if (!reduce && fine) {
        var sweepTween = gsap.to(sweep, {
            p: 1, ease: 'none',
            onUpdate: function () { applySweep(sweep.p); },
            scrollTrigger: { trigger: hero, start: function () { return 'top ' + stripHeight() + 'px'; }, end: '+=120%', pin: true, pinSpacing: true, scrub: 0.4 }
        });
        pinST = sweepTween.scrollTrigger;
    } else if (!reduce && !saveData) {
        gsap.to(sweep, { p: 1, duration: 3.2, delay: 0.6, ease: 'power2.inOut', onUpdate: function () { applySweep(sweep.p); } });
    }

    // The strip docks as the hero leaves: after the pin on desktop, as the hero exits elsewhere.
    if (reduce) {
        ScrollTrigger.create({
            trigger: hero, start: 'bottom 70%',
            onEnter: function () { strip.style.setProperty('--dock', 1); strip.classList.add('is-docked'); },
            onLeaveBack: function () { strip.style.setProperty('--dock', 0); strip.classList.remove('is-docked'); }
        });
    } else {
        gsap.fromTo(strip, { '--dock': 0 }, {
            '--dock': 1, ease: 'none',
            scrollTrigger: {
                trigger: hero,
                start: pinST ? function () { return pinST.end; } : 'bottom bottom',
                end: pinST ? function () { return pinST.end + window.innerHeight * 0.45; } : 'bottom 45%',
                scrub: true,
                onUpdate: function (self) { strip.classList.toggle('is-docked', self.progress > 0.55); }
            }
        });
    }

    if (reduce) return;

    // Load: the daylight bands wipe outward from the playhead, the headline rises in line masks.
    var ph0 = parseFloat(getComputedStyle(lanesEl).getPropertyValue('--ph')) || 0.5;
    qa('.lane-track').forEach(function (track, i) {
        gsap.fromTo(track, { clipPath: 'inset(0 ' + ((1 - ph0) * 100).toFixed(2) + '% 0 ' + (ph0 * 100).toFixed(2) + '%)' },
            { clipPath: 'inset(0 0% 0 0%)', duration: 0.55, delay: 0.15 + i * 0.04, ease: 'power2.out', clearProps: 'clipPath' });
    });
    var h1 = q('.hero h1');
    if (window.SplitText && h1) {
        SplitText.create(h1, {
            type: 'lines', mask: 'lines', autoSplit: true, linesClass: 'line',
            onSplit: function (self) {
                return gsap.from(self.lines, { yPercent: 110, duration: 0.9, ease: 'power3.out', stagger: 0.06, delay: 0.25 });
            }
        });
    } else if (h1) {
        gsap.from(h1, { y: 24, opacity: 0, duration: 0.8, ease: 'power3.out', delay: 0.25 });
    }
    gsap.from(['.hero .now', '.hero .lede', '.hero .sentence', '.hero .hero-links'], { y: 14, opacity: 0, duration: 0.7, ease: 'power3.out', stagger: 0.08, delay: 0.55 });

    // Frames: the chrome bar draws, the capture wipes in under the scroll, the image drifts,
    // the scrub bar fills with the frame's travel through the viewport, the caption sets in.
    qa('.work').forEach(function (work, i) {
        var chrome = q('.frame-chrome', work), screen = q('.frame-screen', work), img = q('img', screen);
        var scrub = q('.frame-scrub span', work), caps = qa('figcaption > *', work);
        var col = work.closest('.work-list--small') ? (i % 2) : 0;
        gsap.from(chrome, { scaleX: 0, transformOrigin: 'left center', duration: 0.4, ease: 'power2.out', delay: col * 0.08,
            scrollTrigger: { trigger: work, start: 'top 82%' } });
        gsap.fromTo(screen, { clipPath: 'inset(0 100% 0 0)' }, { clipPath: 'inset(0 0% 0 0)', ease: 'none',
            scrollTrigger: { trigger: work, start: 'top 82%', end: 'top 42%', scrub: true } });
        gsap.fromTo(img, { yPercent: -2, scale: 1.05 }, { yPercent: 2, scale: 1.05, ease: 'none',
            scrollTrigger: { trigger: work, start: 'top bottom', end: 'bottom top', scrub: true } });
        gsap.fromTo(scrub, { scaleX: 0 }, { scaleX: 1, ease: 'none', transformOrigin: 'left center',
            scrollTrigger: { trigger: work, start: 'top bottom', end: 'bottom top', scrub: true } });
        gsap.from(caps, { yPercent: 60, opacity: 0, duration: 0.6, ease: 'power3.out', stagger: 0.08, delay: 0.25 + col * 0.08,
            scrollTrigger: { trigger: work, start: 'top 82%' } });
    });

    // Experience: the axis appears, each bar wipes in from its start year.
    if (yearsEl) {
        gsap.from(qa('.year-tick', yearsEl), { opacity: 0, duration: 0.4, stagger: 0.04, scrollTrigger: { trigger: yearsEl, start: 'top 85%' } });
        gsap.from(qa('.year-bar', yearsEl), { scaleX: 0, transformOrigin: 'left center', duration: 0.7, ease: 'power3.out', stagger: 0.08, delay: 0.2,
            scrollTrigger: { trigger: yearsEl, start: 'top 85%' } });
        gsap.from(qa('.year-label', yearsEl), { opacity: 0, duration: 0.4, stagger: 0.05, delay: 0.3, scrollTrigger: { trigger: yearsEl, start: 'top 85%' } });
    }
    gsap.from(qa('.role'), { y: 16, opacity: 0, duration: 0.6, ease: 'power3.out', stagger: 0.06, scrollTrigger: { trigger: '.roles', start: 'top 85%' } });

    // Capabilities rise in their rows. About: the prose rises once, the arc draws with the scroll.
    gsap.from(qa('.caps > div'), { y: 18, opacity: 0, duration: 0.6, ease: 'power3.out', stagger: 0.06, scrollTrigger: { trigger: '.caps', start: 'top 85%' } });
    gsap.from(qa('.prose p'), { y: 18, opacity: 0, duration: 0.6, ease: 'power3.out', stagger: 0.1, scrollTrigger: { trigger: '.prose', start: 'top 85%' } });
    if (arcPath) {
        var len = arcPath.getTotalLength();
        gsap.fromTo(arcPath, { strokeDasharray: len, strokeDashoffset: len }, { strokeDashoffset: 0, ease: 'none',
            scrollTrigger: { trigger: arc, start: 'top 90%', end: 'top 45%', scrub: true } });
        gsap.from(arcSun, { scale: 0, transformOrigin: 'center', duration: 0.5, delay: 0.2, scrollTrigger: { trigger: arc, start: 'top 55%' } });
    }

    // Contact: the address wipes in from the left.
    gsap.fromTo('.email', { clipPath: 'inset(0 100% 0 0)' }, { clipPath: 'inset(0 0% 0 0)', duration: 0.9, ease: 'power3.out', clearProps: 'clipPath',
        scrollTrigger: { trigger: '.email', start: 'top 88%' } });
    gsap.from(['.visitor', '.contact-links'], { y: 14, opacity: 0, duration: 0.6, ease: 'power3.out', stagger: 0.1, delay: 0.3, scrollTrigger: { trigger: '.email', start: 'top 88%' } });

    // Keep ScrollTrigger honest when the layout changes.
    qa('.role details').forEach(function (d) { d.addEventListener('toggle', function () { ScrollTrigger.refresh(); }); });
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { ScrollTrigger.refresh(); });
})();
