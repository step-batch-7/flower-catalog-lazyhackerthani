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
  const flowerName = `${req.url.slice(1)}`;
  const description = fs.readFileSync(
    `${STATIC_FOLDER}/documents/${flowerName}.txt`,
    'utf8'
  );
  return generateFlowerFile({ flowerName, description });
};

const addComment = function(message) {
  const commentText = `<br>${message.name} : ${message.comment}<br>`;
  fs.appendFileSync('./public/messages.html', commentText, 'utf8');

  return 0;
};

const findHandler = req => {
  if (req.method === 'GET' && req.url === '/') {
    req.url += 'index.html';
    return serveFile;
  }
  if (
    req.method === 'GET' &&
    (req.url === '/Abeliophyllum' || req.url === '/Agerantum')
  )
    return giveFlowerPage;
  if (req.method === 'GET') return serveFile;
  if (req.method === 'POST') {
    addComment(req.body);
    return serveFile;
  }
  return () => new Response();
};

const processRequest = req => {
  const handler = findHandler(req);
  return handler(req);
};

module.exports = { processRequest };
