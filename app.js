const fs = require('fs');
const Response = require('./lib/response');
const { loadTemplate } = require('./lib/viewTemplate');
const CONTENT_TYPES = require('./lib/mimeTypes');
const STATIC_FOLDER = `${__dirname}/public`;

const serveFile = req => {
  const path = `${STATIC_FOLDER}${req.url}`;
  const stat = fs.existsSync(path) && fs.statSync(path);
  if (!stat || !stat.isFile()) return new Response();
  const [, extension] = path.match(/.*\.(.*)$/) || [];
  const contentType = CONTENT_TYPES[extension];
  const content = fs.readFileSync(path);
  const res = new Response();
  res.setHeader('Content-Type', contentType);
  res.setHeader('Content-Length', content.length);
  res.statusCode = 200;
  res.body = content;
  return res;
};

const generateFlowerFile = flowerDetails => {
  const html = loadTemplate('flower.html', flowerDetails);
  const res = new Response();
  res.setHeader('Content-Type', CONTENT_TYPES.html);
  res.setHeader('Content-Length', html.length);
  res.statusCode = 200;
  res.body = html;
  return res;
};

const giveFlowerPage = req => {
  return generateFlowerFile({ flowerName: 'Abeliophyllum' });
};

const findHandler = req => {
  if (req.method === 'GET' && req.url === '/') {
    req.url += 'index.html';
    return serveFile;
  }
  if (req.method === 'GET' && req.url === '/flower1') return giveFlowerPage;
  if (req.method === 'GET') return serveFile;
  return () => new Response();
};

const processRequest = req => {
  const handler = findHandler(req);
  return handler(req);
};

module.exports = { processRequest };
