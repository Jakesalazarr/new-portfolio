/* time.js — the time engine for jacob-salazar.com.
   Solar position from the NOAA equations, time zones from Intl, and the sky
   (background and ink) computed in OKLab so every hour clears 4.5:1 text
   contrast. Loaded synchronously in <head> so the first paint already has the
   right sky; no API, nothing leaves the browser. */
(function (global) {
    'use strict';

    var CITIES = {
        mnl: { key: 'mnl', name: 'Manila', code: 'MNL', tz: 'Asia/Manila', lat: 14.5995, lon: 120.9842 },
        lax: { key: 'lax', name: 'Los Angeles', code: 'LAX', tz: 'America/Los_Angeles', lat: 34.0522, lon: -118.2437 },
        syd: { key: 'syd', name: 'Sydney', code: 'SYD', tz: 'Australia/Sydney', lat: -33.8688, lon: 151.2093 }
    };
    var RAD = Math.PI / 180;
    var MANILA_OFFSET = 8 * 60; // minutes; the Philippines keep no daylight saving
    var WORK_START = 8, WORK_END = 19;

    function pad(n) { return (n < 10 ? '0' : '') + n; }

    /* ---------------------------------------------------------------- zones */
    var fmtCache = {};
    function fmt(tz) {
        if (!fmtCache[tz]) {
            fmtCache[tz] = new Intl.DateTimeFormat('en-US', {
                timeZone: tz, hourCycle: 'h23', weekday: 'long', year: 'numeric', month: 'numeric',
                day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric'
            });
        }
        return fmtCache[tz];
    }
    function parts(date, tz) {
        var o = {};
        fmt(tz).formatToParts(date).forEach(function (p) { o[p.type] = p.value; });
        var h = (+o.hour) % 24, m = +o.minute;
        return {
            hour: h, minute: m, second: +o.second, weekday: o.weekday,
            year: +o.year, month: +o.month, day: +o.day,
            hhmm: pad(h) + ':' + pad(m), minuteOfDay: h * 60 + m
        };
    }
    function offsetMinutes(date, tz) {
        var p = parts(date, tz);
        var asUTC = Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second);
        return Math.round((asUTC - date.getTime()) / 60000);
    }

    /* ---------------------------------------------------------------- solar (NOAA) */
    function solarBasics(date) {
        var jd = date.getTime() / 86400000 + 2440587.5;
        var t = (jd - 2451545) / 36525;
        var L0 = (280.46646 + t * (36000.76983 + 0.0003032 * t)) % 360;
        var M = 357.52911 + t * (35999.05029 - 0.0001537 * t);
        var Mr = M * RAD;
        var C = Math.sin(Mr) * (1.914602 - t * (0.004817 + 0.000014 * t)) + Math.sin(2 * Mr) * (0.019993 - 0.000101 * t) + Math.sin(3 * Mr) * 0.000289;
        var omega = (125.04 - 1934.136 * t) * RAD;
        var lambda = (L0 + C - 0.00569 - 0.00478 * Math.sin(omega)) * RAD;
        var e = 0.016708634 - t * (0.000042037 + 0.0000001267 * t);
        var eps0 = 23 + (26 + (21.448 - t * (46.815 + t * (0.00059 - t * 0.001813))) / 60) / 60;
        var eps = (eps0 + 0.00256 * Math.cos(omega)) * RAD;
        var decl = Math.asin(Math.sin(eps) * Math.sin(lambda));
        var y = Math.tan(eps / 2); y = y * y;
        var L0r = L0 * RAD;
        var eot = 4 / RAD * (y * Math.sin(2 * L0r) - 2 * e * Math.sin(Mr) + 4 * e * y * Math.sin(Mr) * Math.cos(2 * L0r) - 0.5 * y * y * Math.sin(4 * L0r) - 1.25 * e * e * Math.sin(2 * Mr));
        return { decl: decl, eot: eot };
    }
    // Sun altitude in degrees at an instant, for a latitude and longitude.
    function altitude(date, lat, lon) {
        var b = solarBasics(date);
        var minutesUTC = date.getUTCHours() * 60 + date.getUTCMinutes() + date.getUTCSeconds() / 60;
        var tst = (minutesUTC + b.eot + 4 * lon) % 1440;
        if (tst < 0) tst += 1440;
        var ha = tst / 4 - 180;
        var cosZ = Math.sin(lat * RAD) * Math.sin(b.decl) + Math.cos(lat * RAD) * Math.cos(b.decl) * Math.cos(ha * RAD);
        return 90 - Math.acos(Math.max(-1, Math.min(1, cosZ))) / RAD;
    }
    // Sunrise, solar noon and sunset (Date objects) for a city's local date.
    function sunEvents(date, cityKey) {
        var c = CITIES[cityKey];
        var p = parts(date, c.tz);
        var localNoon = new Date(Date.UTC(p.year, p.month - 1, p.day, 12) - offsetMinutes(date, c.tz) * 60000);
        var b = solarBasics(localNoon);
        var dayStart = Date.UTC(localNoon.getUTCFullYear(), localNoon.getUTCMonth(), localNoon.getUTCDate());
        var noonUTC = 720 - 4 * c.lon - b.eot;
        var cosHA = Math.cos(90.833 * RAD) / (Math.cos(c.lat * RAD) * Math.cos(b.decl)) - Math.tan(c.lat * RAD) * Math.tan(b.decl);
        var ha0 = Math.acos(Math.max(-1, Math.min(1, cosHA))) / RAD;
        return {
            sunrise: new Date(dayStart + (noonUTC - ha0 * 4) * 60000),
            noon: new Date(dayStart + noonUTC * 60000),
            sunset: new Date(dayStart + (noonUTC + ha0 * 4) * 60000)
        };
    }

    /* ---------------------------------------------------------------- OKLab */
    function oklabToLinear(L, a, b) {
        var l_ = L + 0.3963377774 * a + 0.2158037573 * b;
        var m_ = L - 0.1055613458 * a - 0.0638541728 * b;
        var s_ = L - 0.0894841775 * a - 1.2914855480 * b;
        var l = l_ * l_ * l_, m = m_ * m_ * m_, s = s_ * s_ * s_;
        return [
            4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
            -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
            -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s
        ];
    }
    function lchToLinear(L, C, h) { var r = h * RAD; return oklabToLinear(L, C * Math.cos(r), C * Math.sin(r)); }
    function clamp01(v) { return Math.max(0, Math.min(1, v)); }
    function gamma(c) { c = clamp01(c); return c <= 0.0031308 ? 12.92 * c : 1.055 * Math.pow(c, 1 / 2.4) - 0.055; }
    function hexOf(lin) {
        return '#' + lin.map(function (c) { var v = Math.round(gamma(c) * 255); return (v < 16 ? '0' : '') + v.toString(16); }).join('');
    }
    function luminance(lin) { return 0.2126 * clamp01(lin[0]) + 0.7152 * clamp01(lin[1]) + 0.0722 * clamp01(lin[2]); }
    function ratio(y1, y2) { var a = Math.max(y1, y2), b = Math.min(y1, y2); return (a + 0.05) / (b + 0.05); }
    function hexToLuminance(hex) {
        var n = parseInt(hex.slice(1), 16);
        var lin = [n >> 16 & 255, n >> 8 & 255, n & 255].map(function (v) { v /= 255; return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); });
        return luminance(lin);
    }

    /* ---------------------------------------------------------------- the ramp
       Sun altitude over Manila -> background in OKLCH (L, C, hue). Night is a slate
       blue-black, twilight passes through violet and a dim amber, day is warm paper.
       The step between -0.5 and +0.5 degrees is deliberate: backgrounds between
       L 0.55 and 0.60 cannot carry 4.5:1 text with either a light or a dark ink, so
       the ramp crosses that band inside a single sunrise minute and the ink flips. */
    var KEYS = [
        [-90, 0.17, 0.020, 252],
        [-18, 0.18, 0.022, 252],
        [-12, 0.21, 0.028, 255],
        [-6, 0.31, 0.040, 262],
        [-3, 0.42, 0.055, 35],
        [-0.5, 0.53, 0.060, 45],
        [0.5, 0.66, 0.035, 72],
        [6, 0.86, 0.022, 82],
        [15, 0.94, 0.014, 85],
        [30, 0.96, 0.012, 85],
        [90, 0.965, 0.011, 85]
    ];
    function lerp(a, b, t) { return a + (b - a) * t; }
    function lerpHue(a, b, t) { var d = ((b - a + 540) % 360) - 180; return (a + d * t + 360) % 360; }
    function bgFor(alt) {
        if (alt <= KEYS[0][0]) return KEYS[0].slice(1);
        for (var i = 1; i < KEYS.length; i++) {
            if (alt <= KEYS[i][0]) {
                var k0 = KEYS[i - 1], k1 = KEYS[i], t = (alt - k0[0]) / (k1[0] - k0[0]);
                // The sunrise step: no interpolation through the band no ink can carry.
                if (k0[0] === -0.5 && k1[0] === 0.5) return alt < 0 ? k0.slice(1) : k1.slice(1);
                return [lerp(k0[1], k1[1], t), lerp(k0[2], k1[2], t), lerpHue(k0[3], k1[3], t)];
            }
        }
        return KEYS[KEYS.length - 1].slice(1);
    }
    // An ink for a background: the tinted dark or light ink, pushed toward pure
    // black or white only as far as needed to clear the target ratio.
    function inkFor(bg, target) {
        var yBg = luminance(lchToLinear(bg[0], bg[1], bg[2]));
        var dark = bg[0] >= 0.6;
        var L = dark ? 0.22 : 0.93, C = dark ? 0.012 : 0.008;
        for (var i = 0; i < 40; i++) {
            var lin = lchToLinear(L, C, bg[2]);
            if (ratio(luminance(lin), yBg) >= target) return [L, C, bg[2]];
            L += dark ? -0.02 : 0.01;
            C *= 0.9;
            if (L < 0) L = 0; if (L > 1) L = 1;
        }
        return dark ? [0, 0, bg[2]] : [1, 0, bg[2]];
    }
    function mixL(a, b, t) { return [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerpHue(a[2], b[2], t)]; }
    function tokensFor(alt, dark) {
        if (dark) alt = Math.min(alt, -0.5);
        var bg = bgFor(alt);
        var ink = inkFor(bg, 4.7);
        var yBg = luminance(lchToLinear(bg[0], bg[1], bg[2]));
        var ink2 = null;
        for (var t = 0.34; t >= 0; t -= 0.04) {
            var cand = mixL(ink, bg, t);
            if (ratio(luminance(lchToLinear(cand[0], cand[1], cand[2])), yBg) >= 4.65) { ink2 = cand; break; }
        }
        if (!ink2) ink2 = ink;
        var line = mixL(ink, bg, 0.78);
        var bg2 = mixL(bg, ink, 0.07);
        var isDark = bg[0] < 0.6;
        return {
            altitude: alt,
            isDark: isDark,
            bg: hexOf(lchToLinear(bg[0], bg[1], bg[2])),
            ink: hexOf(lchToLinear(ink[0], ink[1], ink[2])),
            ink2: hexOf(lchToLinear(ink2[0], ink2[1], ink2[2])),
            line: hexOf(lchToLinear(line[0], line[1], line[2])),
            bg2: hexOf(lchToLinear(bg2[0], bg2[1], bg2[2])),
            red: isDark ? '#f5563f' : '#c8381f',
            day: hexOf(lchToLinear(0.88, 0.12, 95))
        };
    }

    /* ---------------------------------------------------------------- Manila day maths */
    function manilaDayStart(date) {
        var p = parts(date, CITIES.mnl.tz);
        return Date.UTC(p.year, p.month - 1, p.day) - MANILA_OFFSET * 60000;
    }
    function manilaMinute(date) { return parts(date, CITIES.mnl.tz).minuteOfDay; }
    function atManilaMinute(date, minute) { return new Date(manilaDayStart(date) + minute * 60000); }
    function toManilaMinute(instant, dayStartMs) {
        var m = ((instant.getTime() - dayStartMs) / 60000) % 1440;
        return m < 0 ? m + 1440 : m;
    }
    // Working-hours state of a city at an instant: before, working or after, with hours.
    function workState(date, cityKey) {
        var p = parts(date, CITIES[cityKey].tz);
        var h = p.hour + p.minute / 60;
        if (h < WORK_START) return { state: 'before', hours: WORK_START - h };
        if (h < WORK_END) return { state: 'working', hours: h - WORK_START };
        return { state: 'after', hours: h - WORK_END };
    }
    function isOffHours(date, cityKey) { return workState(date, cityKey).state !== 'working'; }

    /* ---------------------------------------------------------------- state and paint */
    var state = { pinned: null, preview: null, tokens: null };
    function now() { return new Date(); }
    function current() { return state.preview || state.pinned || now(); }
    function prefersDark() {
        try { return !!(global.matchMedia && global.matchMedia('(prefers-color-scheme: dark)').matches); } catch (e) { return false; }
    }
    function paint(root, date) {
        var alt = altitude(date, CITIES.mnl.lat, CITIES.mnl.lon);
        var t = tokensFor(alt, prefersDark());
        var s = root.style;
        s.setProperty('--bg', t.bg); s.setProperty('--ink', t.ink); s.setProperty('--ink-2', t.ink2);
        s.setProperty('--line', t.line); s.setProperty('--bg-2', t.bg2); s.setProperty('--red', t.red); s.setProperty('--day', t.day);
        s.colorScheme = t.isDark ? 'dark' : 'light';
        root.setAttribute('data-sky', alt > 0.5 ? 'day' : alt > -6 ? 'dusk' : 'night');
        var meta = root.ownerDocument.querySelector('meta[name="theme-color"]');
        if (meta) meta.setAttribute('content', t.bg);
        state.tokens = t;
        return t;
    }
    function readAtParam() {
        var m = /[?&]at=(\d{1,2}):(\d{2})/.exec(global.location.search || '');
        if (!m) return null;
        var h = +m[1], mi = +m[2];
        return (h < 24 && mi < 60) ? h * 60 + mi : null;
    }
    function boot(root) {
        var at = readAtParam();
        if (at !== null) state.pinned = atManilaMinute(now(), at);
        return paint(root, current());
    }

    global.JSTime = {
        CITIES: CITIES, WORK_START: WORK_START, WORK_END: WORK_END,
        pad: pad, parts: parts, offsetMinutes: offsetMinutes,
        altitude: altitude, sunEvents: sunEvents,
        tokensFor: tokensFor, hexToLuminance: hexToLuminance, ratio: ratio,
        manilaDayStart: manilaDayStart, manilaMinute: manilaMinute, atManilaMinute: atManilaMinute, toManilaMinute: toManilaMinute,
        workState: workState, isOffHours: isOffHours,
        state: state, now: now, current: current, paint: paint, boot: boot, prefersDark: prefersDark
    };
})(window);
