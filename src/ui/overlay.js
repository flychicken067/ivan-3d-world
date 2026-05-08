import { ZONES } from '../config.js';
import { events } from '../events.js';
import { getControls } from '../controls/camera.js';

const overlayEl = document.getElementById('panel-overlay');

function renderPanel(zone) {
  const { content } = zone;

  // Build tag HTML
  const tagHtml = content.tag
    ? `<span class="tag tag-${content.tag.variant}">${content.tag.text}</span>`
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

  // Build buttons HTML
  const buttonsHtml = (content.buttons || []).map(btn =>
    `<a href="${btn.url}" class="${btn.primary ? 'btn-primary' : 'btn-ghost'}">${btn.text}</a>`
  ).join('');

  return `
    <div class="panel">
      <div class="panel-header">
        <div>
          <div class="panel-eyebrow">${content.eyebrow || ''}</div>
        </div>
        <button class="panel-close" id="panel-close-btn">ESC</button>
      </div>
      <div class="panel-body">
        <h3>${content.title || ''}</h3>
        <hr class="panel-divider" />
        <p>${content.body || ''}</p>
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
  overlayEl.classList.add('hidden');
  overlayEl.innerHTML = '';

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
