// src/ui/share.js
// Share button — captures the current canvas with a watermark and downloads as PNG.

let renderFn = null;

/**
 * @param {object} opts
 * @param {HTMLCanvasElement} opts.canvas
 * @param {Function} [opts.render] — optional function to force a fresh render before capture.
 */
export function initShare({ canvas, render } = {}) {
  if (!canvas) return;
  renderFn = render || null;

  const btn = document.getElementById('share-btn');
  if (!btn) return;

  btn.addEventListener('click', () => {
    try {
      // Force a fresh render so the most recent frame is in the canvas buffer
      // (WebGL canvases otherwise return blank when toDataURL is called late).
      if (typeof renderFn === 'function') renderFn();

      // Compose a temp 2D canvas with the WebGL frame + watermark.
      const out = document.createElement('canvas');
      out.width = canvas.width;
      out.height = canvas.height;
      const ctx = out.getContext('2d');
      ctx.drawImage(canvas, 0, 0);

      // Watermark — bottom-right.
      const fontSize = Math.max(14, Math.round(out.height * 0.022));
      ctx.font = `${fontSize}px Georgia, serif`;
      ctx.fillStyle = 'rgba(239, 231, 211, 0.85)';
      ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
      ctx.shadowBlur = 6;
      ctx.textAlign = 'right';
      ctx.textBaseline = 'bottom';
      const pad = Math.round(out.height * 0.025);
      ctx.fillText("ivan's world", out.width - pad, out.height - pad);

      const dataUrl = out.toDataURL('image/png');
      const ts = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = `ivans-world-${ts}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (err) {
      console.warn('[share] capture failed', err);
    }
  });
}
