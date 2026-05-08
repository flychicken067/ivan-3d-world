// Live clock injected into the start screen, just below the WHAT'S NEW line.
// Updates every second. Hidden on mobile via CSS (.desktop-only).

let _intervalId = null;

function getZoneLabel() {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || 'local';
    // Pull the last segment of the IANA name, e.g. "Asia/Tokyo" → "Tokyo"
    const parts = tz.split('/');
    const city = parts[parts.length - 1].replace(/_/g, ' ');
    return `${city} time`;
  } catch (_) {
    return 'local time';
  }
}

function formatNow() {
  const now = new Date();
  let h = now.getHours();
  const m = now.getMinutes();
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12;
  if (h === 0) h = 12;
  const mm = m < 10 ? `0${m}` : `${m}`;
  return `${h}:${mm} ${ampm}`;
}

export function initStartClock() {
  try {
    const startContent = document.querySelector('.start-content');
    const whatsNew = document.querySelector('.start-whats-new');
    if (!startContent || !whatsNew) return;
    if (document.querySelector('.start-clock')) return;

    const zone = getZoneLabel();
    const el = document.createElement('div');
    el.className = 'start-clock desktop-only';
    el.textContent = `${formatNow()} · ${zone}`;

    // Insert directly after the WHAT'S NEW line.
    if (whatsNew.nextSibling) {
      startContent.insertBefore(el, whatsNew.nextSibling);
    } else {
      startContent.appendChild(el);
    }

    if (_intervalId) clearInterval(_intervalId);
    _intervalId = setInterval(() => {
      const live = document.querySelector('.start-clock');
      if (!live) {
        clearInterval(_intervalId);
        _intervalId = null;
        return;
      }
      live.textContent = `${formatNow()} · ${zone}`;
    }, 1000);
  } catch (_) { /* ignore */ }
}
