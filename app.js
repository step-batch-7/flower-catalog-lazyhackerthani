const fs = require('fs');
const Response = require('./lib/response');
const oldComments = require('./public/documents/comments.json');
const { loadTemplate } = require('./lib/viewTemplate');
const CONTENT_TYPES = require('./lib/mimeTypes');
const STATIC_FOLDER = `${__dirname}/public`;
const successCode = 200;

const generateResponse = (contentType, content, statusCode) => {
  const res = new Response(statusCode, content);
  res.setHeader('Content-Type', contentType);
  res.setHeader('Content-Length', content.length);
  return res;
};

const serveFile = function(req) {
  const path = `${STATIC_FOLDER}${req.url}`;
  const stat = fs.existsSync(path) && fs.statSync(path);
  if (!stat || !stat.isFile()) {
    return new Response();
  }
  const [, extension] = path.match(/.*\.(.*)$/) || [];
  const contentType = CONTENT_TYPES[extension];
  const content = fs.readFileSync(path);
  return generateResponse(contentType, content, successCode);
};

const giveFlowerPage = req => {
  const flowerName = `${req.url.slice(1)}`;
  const description = fs.readFileSync(
    `${STATIC_FOLDER}/documents/${flowerName}.txt`,
    'utf8'
  );
  const content = loadTemplate('flower.html', { flowerName, description });
  return generateResponse(CONTENT_TYPES.html, content, successCode);
};

const giveGuestBook = ({ body }) => {
  const commentDetails = {
    name: body.name,
    comment: body.comment,
    time: new Date()
  };
  if (body.comment) {
    oldComments.unshift(commentDetails);
  }

  fs.writeFileSync(
    './public/documents/comments.json',
    JSON.stringify(oldComments),
    'utf8'
  );
  let html = '';
  oldComments.forEach(commentDetail => {
    html += `<div class="commentBox"> ${commentDetail.name} ( ${new Date(
      commentDetail.time
    )} ) : ${commentDetail.comment}</div>`;
  });
  const content = loadTemplate('guestBook.html', { comment: html });
  return generateResponse(CONTENT_TYPES.html, content, successCode);
};

const findHandler = function(req) {
  if (req.method === 'GET' && req.url === '/') {
    req.url += 'index.html';
    return serveFile;
  }
  if (
    req.method === 'GET' &&
    (req.url === '/Abeliophyllum' || req.url === '/Agerantum')
  ) {
    return giveFlowerPage;
  }
  if (
    (req.method === 'GET' || req.method === 'POST') &&
    req.url === '/guestBook'
  ) {
    return giveGuestBook;
  }
  if (req.method === 'GET') {
    return serveFile;
  }
  return () => new Response();
};

const processRequest = req => {
  const handler = findHandler(req);
  return handler(req);
};

module.exports = { processRequest };
