const express = require('express');
const path = require('path');
const fs = require('fs');
require('dotenv').config()

const app = express();

const cookieParser = require('cookie-parser');
app.use(cookieParser());

const VISIT_COOKIE = 'visited';
const TELEGRAM_API = `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`;

function escapeHtml(s) {
  return String(s).replace(/[&<>]/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;' }[c]));
}

async function notifyTelegram(req) {
  const h = req.headers;
  const ip = h['x-forwarded-for']?.split(',')[0].trim() || req.socket.remoteAddress;
  const text = [
    '<b>New visitor</b>',
    `<b>Path:</b> ${escapeHtml(req.path)}`,
    `<b>IP:</b> ${escapeHtml(ip)}`,
    `<b>User-Agent:</b> ${escapeHtml(h['user-agent'] || '-')}`,
    `<b>Referer:</b> ${escapeHtml(h['referer'] || '-')}`,
    `<b>Accept-Language:</b> ${escapeHtml(h['accept-language'] || '-')}`,
    `<b>Time:</b> ${new Date().toISOString()}`,
  ].join('\n');

  const res = await fetch(TELEGRAM_API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: process.env.TELEGRAM_CHAT_ID, text, parse_mode: 'HTML' }),
  });
  if (!res.ok) console.error('Telegram notify failed:', res.status, await res.text());
}

app.use((req, res, next) => {
  if (req.method === 'GET' && !req.cookies[VISIT_COOKIE]) {
    res.cookie(VISIT_COOKIE, '1', { maxAge: 1000 * 60 * 60 * 24 * 365, httpOnly: true, sameSite: 'lax' });
    notifyTelegram(req).catch(err => console.error('Telegram notify error:', err));
  }
  next();
});

const PORT = process.env.PORT || 3000;

const LOGS_DIR = path.join(__dirname, 'logs');
const VISITS_LOG = path.join(LOGS_DIR, 'visits.log');
if (!fs.existsSync(LOGS_DIR)) fs.mkdirSync(LOGS_DIR, { recursive: true });

function logEvent(eventName) {
  return (req, res, next) => {
    const entry = {
      timestamp: new Date().toISOString(),
      event: eventName,
      ip: req.ip,
      userAgent: req.headers['user-agent'] || '-',
      referrer: req.headers['referer'] || '-',
      path: req.originalUrl,
    };
    const line = `${entry.timestamp} | event=${entry.event} | ip=${entry.ip} | ua="${entry.userAgent}" | ref="${entry.referrer}" | path=${entry.path}\n`;
    fs.appendFile(VISITS_LOG, line, (err) => {
      if (err) console.error('Failed to write visit log:', err);
    });
    console.log(line.trim());
    next();
  };
}

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', logEvent('landing_page_visit'), (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'landing.html'));
});

app.get('/scan', logEvent('scan_page_visit'), (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'scan.html'));
});

app.get('/scan/download', logEvent('scan_download_triggered'), (req, res) => {
  const filePath = path.join(__dirname, 'downloads', 'security_scan.txt');
  res.download(filePath, 'SecurityScan.txt');
});

app.listen(PORT, () => {
  console.log(`goPhish demo server running at http://localhost:${PORT}`);
});
