import { ZONES } from '../config.js';
import { events } from '../events.js';
import { getControls } from '../controls/camera.js';

const overlayEl = document.getElementById('panel-overlay');

// Zone code → accent stripe color
const ZONE_STRIPE = {
  '01': '#4a6a3a',
  '02': '#6a4a2a',
  '03': '#8a7438',
  '04': '#4a3a6a',
  '05': '#6a3838',
  '06': '#2a5c7a',
  '07': '#7a3838',
};

function renderPanel(zone) {
  const { content } = zone;
  const stripeColor = ZONE_STRIPE[zone.code] || '#4a6a3a';

  // Build tag HTML
  const tagHtml = content.tag
    ? `<span class="tag tag-${content.tag.variant}">${content.tag.text}</span>`
    : '';

  // Optional media (image url) — if zone.content.media is set
  const mediaHtml = content.media
    ? `<div class="panel-media"><img src="${content.media}" alt="${content.title || ''}" loading="lazy"/></div>`
    : '';

  // Optional metrics — array of {label, value}
  const metricsHtml = content.metrics
    ? `<div class="panel-metrics">${content.metrics.map(m => `<div class="metric"><div class="metric-value">${m.value}</div><div class="metric-label">${m.label}</div></div>`).join('')}</div>`
    : '';

  // Build form HTML if needed
  let formHtml = '';
  if (content.hasForm) {
    formHtml = `
      <div class="form-field">
        <label class="form-label">Name</label>
        <input type="text" class="form-input" placeholder="Your name" />
      </div>
      <div class="form-field">
        <label class="form-label">Email</label>
        <input type="email" class="form-input" placeholder="your@email.com" />
      </div>
      <div class="form-field">
        <label class="form-label">Project Brief</label>
        <textarea class="form-input form-textarea" placeholder="Tell me about your project..."></textarea>
      </div>`;
  }

  // Build buttons HTML — open external links in new tab
  const buttonsHtml = (content.buttons || []).map(btn => {
    const isExternal = btn.url && btn.url !== '#' && !btn.url.startsWith('mailto:');
    const targetAttr = isExternal ? ' target="_blank" rel="noopener noreferrer"' : '';
    return `<a href="${btn.url}"${targetAttr} class="${btn.primary ? 'btn-primary' : 'btn-ghost'}">${btn.text}</a>`;
  }).join('');

  return `
    <div class="panel">
      <div class="panel-stripe" style="background:${stripeColor}"></div>
      <div class="panel-header">
        <div>
          <div class="panel-eyebrow">${content.eyebrow || ''}</div>
        </div>
        <button class="panel-close" id="panel-close-btn" aria-label="Close panel">ESC</button>
      </div>
      <div class="panel-body">
        ${mediaHtml}
        <h3 class="panel-title">${content.title || ''}</h3>
        <hr class="panel-divider" />
        <p>${content.body || ''}</p>
        ${metricsHtml}
        ${tagHtml}
        ${formHtml}
      </div>
      ${buttonsHtml.length ? `<div class="panel-footer">${buttonsHtml}</div>` : ''}
    </div>`;
}

export function openPanel(zoneCode) {
  const zone = ZONES.find(z => z.code === zoneCode);
  if (!zone) return;

  overlayEl.innerHTML = renderPanel(zone);
  overlayEl.classList.remove('hidden');

  // Unlock pointer so mouse cursor is usable in the panel
  const controls = getControls();
  if (controls && document.pointerLockElement) {
    controls.unlock();
  }

  // Wire close button
  const closeBtn = document.getElementById('panel-close-btn');
  if (closeBtn) closeBtn.addEventListener('click', closePanel);
}

export function closePanel() {
  // Animate out before hiding
  overlayEl.classList.add('closing');
  setTimeout(() => {
    overlayEl.classList.remove('closing');
    overlayEl.classList.add('hidden');
    overlayEl.innerHTML = '';
  }, 200);

  // Re-lock pointer to resume world navigation
  const controls = getControls();
  if (controls && !document.pointerLockElement) {
    controls.lock();
  }
}

export function isPanelOpen() {
  return !overlayEl.classList.contains('hidden');
}

export function initOverlay() {
  // Listen for zone click events
  events.on('zone:click', ({ code }) => {
    openPanel(code);
  });

  // Escape key closes panel
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isPanelOpen()) {
      closePanel();
    }
  });
}
