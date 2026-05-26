/**
 * Simple development server for local testing.
 * Serves static files from /public and handles API routes.
 * Adds Express-like res.status().json() compatibility for Vercel handlers.
 * Usage: node server.js
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const calculateHandler = require('./api/calculate');

const PORT = 3000;

const MIME_TYPES = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

/**
 * Add Express-like helpers to the raw http.ServerResponse
 * so Vercel-style handlers (res.status(200).json({...})) work locally.
 */
function enhanceResponse(res) {
  res.status = function (code) {
    res.statusCode = code;
    return res;
  };

  res.json = function (data) {
    const body = JSON.stringify(data);
    res.setHeader('Content-Type', 'application/json');
    res.end(body);
    return res;
  };

  return res;
}

const server = http.createServer((req, res) => {
  enhanceResponse(res);

  // API routes
  if (req.url.startsWith('/api/calculate')) {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      if (body) {
        try {
          req.body = JSON.parse(body);
        } catch (e) {
          req.body = {};
        }
      }
      calculateHandler(req, res);
    });
    return;
  }

  // Static files
  let filePath = req.url === '/' ? '/index.html' : req.url;
  // Remove query strings
  filePath = filePath.split('?')[0];
  filePath = path.join(__dirname, 'public', filePath);

  const ext = path.extname(filePath);
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('404 Not Found');
      return;
    }
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(data);
  });
});

server.listen(PORT, () => {
  console.log(`\n  💊 MedDose Development Server`);
  console.log(`  ─────────────────────────────`);
  console.log(`  Local:   http://localhost:${PORT}`);
  console.log(`  Status:  Ready\n`);
});
