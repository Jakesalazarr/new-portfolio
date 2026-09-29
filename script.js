// Live clocks for the cities I have worked with. Each <time data-tz> shows the
// local hour there; cities outside 08:00 to 19:00 local are dimmed, and the
// same state is written for screen readers, so anyone can see at a glance who
// is likely at their desk.
(function () {
    var clocks = document.querySelectorAll('time[data-tz]');
    if (!clocks.length || typeof Intl === 'undefined') return;

    var timeFormats = {};
    var hourFormats = {};

    function formatFor(store, tz, options) {
        if (!store[tz]) {
            options.timeZone = tz;
            store[tz] = new Intl.DateTimeFormat('en-GB', options);
        }
        return store[tz];
    }

    function tick() {
        var now = new Date();
        clocks.forEach(function (el) {
            var tz = el.getAttribute('data-tz');
            try {
                var hhmm = formatFor(timeFormats, tz, { hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).format(now);
                el.textContent = hhmm;
                el.setAttribute('datetime', hhmm);
                var hour = parseInt(formatFor(hourFormats, tz, { hour: 'numeric', hourCycle: 'h23' }).format(now), 10);
                var off = hour < 8 || hour >= 19;
                var row = el.closest('div');
                if (row) {
                    row.classList.toggle('is-off', off);
                    var state = row.querySelector('.clock-state');
                    if (state) state.textContent = off ? ', outside working hours' : '';
                }
            } catch (e) {
                el.textContent = '';
            }
        });
    }

    // Tick on the minute, so the digits change when a real clock's would.
    function schedule() {
        var delay = 60000 - (Date.now() % 60000) + 50;
        setTimeout(function () { tick(); schedule(); }, delay);
    }

    tick();
    schedule();
    document.addEventListener('visibilitychange', function () {
        if (document.visibilityState === 'visible') tick();
    });
})();

// Printing: open every role's detail so the page reads as a one-sheet on
// paper, then restore whatever the reader had open.
(function () {
    var roleDetails = document.querySelectorAll('.role details');
    if (!roleDetails.length) return;
    window.addEventListener('beforeprint', function () {
        roleDetails.forEach(function (d) {
            d.dataset.wasOpen = d.open ? '1' : '';
            d.open = true;
        });
    });
    window.addEventListener('afterprint', function () {
        roleDetails.forEach(function (d) {
            d.open = d.dataset.wasOpen === '1';
        });
    });
})();
