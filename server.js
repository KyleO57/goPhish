const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
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
