// Cosmetic-only values meant to look technical but slightly "off" on close
// inspection (a raw IP instead of a hostname, an oversized session token).
function randomHex(len) {
  let out = '';
  for (let i = 0; i < len; i++) out += Math.floor(Math.random() * 16).toString(16);
  return out;
}

function randomIp() {
  const octet = () => Math.floor(Math.random() * 255) + 1;
  return `10.${octet()}.${octet()}.${octet()}`;
}

const sessionId = randomHex(24);
const nodeIp = randomIp();
document.getElementById('session-id').textContent = sessionId;
document.getElementById('node-ip').textContent = nodeIp;

const statusEl = document.getElementById('status-msg');
const spinnerEl = document.getElementById('spinner');
const popupLayer = document.getElementById('popup-layer');
const fill = document.getElementById('redirect-fill');

const statusMessages = ['Authenticating device', 'Validating certificate'];
let statusIndex = 0;
const statusInterval = setInterval(() => {
  statusIndex = (statusIndex + 1) % statusMessages.length;
  statusEl.textContent = statusMessages[statusIndex];
}, 450);

// --- Timing budget ---
const LOAD_MS = 1000; // "verifying session" phase before the storm begins
const POPUP_COUNT = 7;
const STAGGER_MS = 220; // delay between each popup appearing
const POPUP_ANIM_MS = 350; // matches the CSS entrance animation duration
const PAUSE_MS = 400; // beat after the last popup settles, before redirect

const TOTAL_MS = LOAD_MS + (POPUP_COUNT - 1) * STAGGER_MS + POPUP_ANIM_MS + PAUSE_MS;

const start = performance.now();
function animateBar(now) {
  const elapsed = now - start;
  const pct = Math.min(100, (elapsed / TOTAL_MS) * 100);
  fill.style.width = pct + '%';
  if (elapsed < TOTAL_MS) requestAnimationFrame(animateBar);
}
requestAnimationFrame(animateBar);

// --- Phase 1: "verification" completes, then the popup storm begins ---
setTimeout(() => {
  clearInterval(statusInterval);
  statusEl.textContent = 'Finalizing session';
  spinnerEl.classList.add('done');

  const popups = window.PopupStorm.generate(POPUP_COUNT);

  popups.forEach((p, i) => {
    setTimeout(() => {
      popupLayer.appendChild(window.PopupStorm.createEl(p, { animClass: 'entering' }));
    }, i * STAGGER_MS);
  });

  // --- Phase 2: storm has finished settling -- persist this exact layout
  // so the scan page can render the same "final frame" as its backdrop.
  const settleDelay = (POPUP_COUNT - 1) * STAGGER_MS + POPUP_ANIM_MS + PAUSE_MS;
  setTimeout(() => {
    sessionStorage.setItem(
      'landingFrame',
      JSON.stringify({ sessionId, nodeIp, status: 'Finalizing session', popups })
    );
    window.location.href = '/scan';
  }, settleDelay);
}, LOAD_MS);
