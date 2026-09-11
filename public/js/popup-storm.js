// Shared popup-storm data/layout generator, used by both the landing page
// (which animates the storm in) and the scan page (which renders the same
// storm frozen in its final layout as a backdrop).
window.PopupStorm = (function () {
  const POOL = [
    { title: 'SYSTEM ALERT', body: 'Your computer is dangerously low on disk space.', accent: '#d92b2b' },
    { title: 'Congratulations!', body: 'You have been selected for a free prize. Click to claim.', accent: '#1a8f4c' },
    { title: 'Windows Security', body: 'Your antivirus subscription has expired.', accent: '#d92b2b' },
    { title: 'New Message (1)', body: 'You have 1 unread message waiting.', accent: '#2b6cff' },
    { title: 'Adobe Flash Player', body: 'A required plugin update is available.', accent: '#7a4fd1' },
    { title: 'Driver Update', body: 'A critical driver update is needed to continue.', accent: '#d98a1f' },
    { title: 'Network Notice', body: 'Unusual activity was detected on this network.', accent: '#d92b2b' },
    { title: 'Browser Notice', body: 'This session will time out soon.', accent: '#2b6cff' },
  ];

  function rand(min, max) {
    return Math.random() * (max - min) + min;
  }

  function generate(count) {
    const items = [];
    for (let i = 0; i < count; i++) {
      const src = POOL[i % POOL.length];
      items.push({
        id: 'p' + i + '-' + Math.floor(Math.random() * 1e6),
        title: src.title,
        body: src.body,
        accent: src.accent,
        top: rand(6, 66),
        left: rand(3, 62),
        width: Math.round(rand(220, 300)),
        rotate: Math.round(rand(-6, 6) * 10) / 10,
        z: 100 + i,
      });
    }
    return items;
  }

  function createEl(p, opts) {
    opts = opts || {};
    const el = document.createElement('div');
    el.className = 'fake-popup' + (opts.animClass ? ' ' + opts.animClass : '');
    el.style.top = p.top + 'vh';
    el.style.left = p.left + 'vw';
    el.style.width = p.width + 'px';
    el.style.zIndex = p.z;
    el.style.setProperty('--rot', p.rotate + 'deg');
    if (!opts.animClass) el.style.transform = `rotate(${p.rotate}deg)`;

    const closeHandler = opts.closable
      ? `onclick="this.closest('.fake-popup').remove()"`
      : '';

    el.innerHTML = `
      <div class="fp-titlebar" style="background:${p.accent}">
        <span>${p.title}</span>
        <span class="fp-close" ${closeHandler}>&times;</span>
      </div>
      <div class="fp-body">${p.body}</div>
    `;
    return el;
  }

  function renderInto(container, popups, opts) {
    popups.forEach((p) => container.appendChild(createEl(p, opts)));
  }

  return { generate, createEl, renderInto };
})();
