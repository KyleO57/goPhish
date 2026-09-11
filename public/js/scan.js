const overlay = document.getElementById('overlay');
const closeBtn = document.getElementById('fake-close');
const dismissBtn = document.getElementById('dismiss-btn');

function hideOverlay() {
  overlay.style.display = 'none';
}

closeBtn.addEventListener('click', hideOverlay);
dismissBtn.addEventListener('click', hideOverlay);

// --- Render the "final frame" carried over from the landing page's popup
// storm as a frozen backdrop. Falls back to a fresh storm if someone lands
// here directly without having gone through the landing page first. ---
const popupLayer = document.getElementById('popup-layer');
const frozenSlot = document.getElementById('frozen-card-slot');

let frame = null;
try {
  const raw = sessionStorage.getItem('landingFrame');
  if (raw) frame = JSON.parse(raw);
} catch (e) {
  frame = null;
}

if (frame && frame.popups) {
  frozenSlot.innerHTML = `
    <div class="portal-card">
      <div class="portal-header">
        <svg class="portal-logo" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2L4 5v6c0 5.25 3.4 9.74 8 11 4.6-1.26 8-5.75 8-11V5l-8-3z" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/>
        </svg>
        <span class="portal-org">Acme Global &mdash; IT Security</span>
        <svg class="padlock" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="5" y="11" width="14" height="9" rx="1.5" stroke="currentColor" stroke-width="1.4"/>
          <path d="M8 11V8a4 4 0 0 1 7.5-2" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>
        </svg>
      </div>
      <div class="portal-body">
        <h1>Verifying Session</h1>
        <p>We&rsquo;re confirming this device meets current compliance requirements before continuing. This is automatic and should only take a moment. Please do not close this window.</p>
        <div class="spinner done"></div>
        <div class="status-lines">
          <div class="status-line"><span class="label">Session ID</span><span>