(function(){
  // Animated cloud favicon
  // Creates a small offscreen canvas, draws animated clouds, and updates
  // the <link id="dynamic-favicon"> href with a PNG data URL.

  const SIZE = 64; // favicon size in pixels
  const UPDATE_MS = 90; // throttle favicon updates (ms)

  const canvas = document.createElement('canvas');
  canvas.width = SIZE;
  canvas.height = SIZE;
  const ctx = canvas.getContext('2d');

  // ensure there's a link element we can update
  let link = document.getElementById('dynamic-favicon');
  if (!link) {
    link = document.createElement('link');
    link.id = 'dynamic-favicon';
    link.rel = 'icon';
    document.head.appendChild(link);
  }

  // helper to draw a colorful cloud (purple -> blue) on transparent background
  function drawColoredCloud(x, y, scale, alpha) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);
    ctx.globalAlpha = alpha;

    // cloud path
    ctx.beginPath();
    ctx.arc(-6, 0, 8, 0, Math.PI * 2);
    ctx.arc(4, -4, 8.5, 0, Math.PI * 2);
    ctx.arc(14, 0, 8.5, 0, Math.PI * 2);
    ctx.arc(6, 6, 7.5, 0, Math.PI * 2);
    ctx.closePath();

    // gradient fill (purple -> blue)
    const grad = ctx.createLinearGradient(-16, -8, 24, 12);
    grad.addColorStop(0, 'rgba(122,92,255,0.98)');
    grad.addColorStop(0.6, 'rgba(106,122,255,0.95)');
    grad.addColorStop(1, 'rgba(58,160,255,0.95)');
    ctx.fillStyle = grad;
    ctx.fill();

    // soft inner highlight
    const highlight = ctx.createRadialGradient(2, -2, 0, 2, -2, 18);
    highlight.addColorStop(0, 'rgba(255,255,255,0.28)');
    highlight.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = highlight;
    ctx.beginPath();
    ctx.arc(4, -2, 10, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
    ctx.globalAlpha = 1;
  }

  // draw scene for given time (ms) - transparent background with purple/blue cloud
  function render(time) {
    const t = time * 0.001;

    // clear to transparent
    ctx.clearRect(0, 0, SIZE, SIZE);

    // Center the cloud in the canvas and use small sine/cosine offsets
    // so the cloud gently floats but never leaves the frame.
    const baseX = SIZE * 0.5;
    const baseY = SIZE * 0.5;

    // gentle horizontal + vertical drift (pixel-level so it stays on-screen)
    const driftX = Math.sin(t * 0.8) * 2.5; // ±2.5px
    const driftY = Math.cos(t * 1.1) * 2.0; // ±2px

    // back layer: slightly smaller, lower alpha
    ctx.globalAlpha = 0.7;
    drawColoredCloud(baseX - 6 + driftX * 0.6, baseY + 6 + driftY * 0.6, 0.92, 0.85);
    ctx.globalAlpha = 1;

    // front/main layer: centered and slightly larger
    drawColoredCloud(baseX + driftX, baseY + driftY, 1.15, 0.98);

    // small soft highlight that also drifts slightly
    const puffX = baseX + Math.sin(t * 1.9) * 1.6;
    const puffY = baseY - 6 + Math.cos(t * 2.3) * 1.2;
    const puffGrad = ctx.createRadialGradient(puffX, puffY, 0, puffX, puffY, 8);
    puffGrad.addColorStop(0, 'rgba(255,255,255,0.95)');
    puffGrad.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = puffGrad;
    ctx.beginPath();
    ctx.arc(puffX, puffY, 2.6, 0, Math.PI * 2);
    ctx.fill();
  }

  // throttle updates to reduce work; update favicon image only at UPDATE_MS intervals
  let lastSet = 0;
  function update(time) {
    render(time);
    if (time - lastSet > UPDATE_MS) {
      try {
        link.href = canvas.toDataURL('image/png');
      } catch (e) {
        // some browsers might throw on toDataURL if canvas is tainted; ignore
      }
      lastSet = time;
    }
    // only animate when page is visible to conserve CPU
    if (!document.hidden) requestAnimationFrame(update);
    else {
      // when hidden, set a single static frame and wait for visibilitychange
      try { link.href = canvas.toDataURL('image/png'); } catch (e) {}
    }
  }

  // pause/resume on visibility change
  document.addEventListener('visibilitychange', function(){
    if (!document.hidden) requestAnimationFrame(update);
  }, {passive:true});

  // start animation
  requestAnimationFrame(update);
})();
