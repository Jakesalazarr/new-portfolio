// Live clocks for the cities I work with. Each <time data-tz> shows the local
// hour there; rows outside 08:00 to 19:00 local are dimmed so a reader can see
// at a glance who is likely at their desk.
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
                el.textContent = formatFor(timeFormats, tz, { hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).format(now);
                var hour = parseInt(formatFor(hourFormats, tz, { hour: 'numeric', hourCycle: 'h23' }).format(now), 10);
                var row = el.closest('div');
                if (row) row.classList.toggle('is-off', hour < 8 || hour >= 19);
            } catch (e) {
                el.textContent = '';
            }
        });
    }

    tick();
    setInterval(tick, 30000);
})();
