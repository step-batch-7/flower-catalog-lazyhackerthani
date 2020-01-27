const fs = require('fs');
const Response = require('./lib/response');
const oldComments = require('./public/documents/comments.json');
const { loadTemplate } = require('./lib/viewTemplate');
const CONTENT_TYPES = require('./lib/mimeTypes');
const STATIC_FOLDER = `${__dirname}/public`;

const generateResponse = (contentType, content, statusCode) => {
  const res = new Response();
  res.setHeader('Content-Type', contentType);
  res.setHeader('Content-Length', content.length);
  res.statusCode = statusCode;
  res.body = content;
  return res;
};

const serveFile = req => {
  const path = `${STATIC_FOLDER}${req.url}`;
  const stat = fs.existsSync(path) && fs.statSync(path);
  if (!stat || !stat.isFile()) return new Response();
  const [, extension] = path.match(/.*\.(.*)$/) || [];
  const contentType = CONTENT_TYPES[extension];
  const content = fs.readFileSync(path);
  return generateResponse(contentType, content, 200);
};

const generateFile = function(templateFileName, propertyBag) {
  const html = loadTemplate(templateFileName, propertyBag);
  return generateResponse(CONTENT_TYPES.html, html, 200);
};

const giveFlowerPage = req => {
  const flowerName = `${req.url.slice(1)}`;
  const description = fs.readFileSync(
    `${STATIC_FOLDER}/documents/${flowerName}.txt`,
    'utf8'
  );
  return generateFile('flower.html', { flowerName, description });
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
    html += `<div><br> ${commentDetail.name} ( ${Date(
      commentDetail.time
    )} ) : ${commentDetail.comment}<br><div>`;
  });
  return generateFile('guestBook.html', { comment: html });
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
  if (
    (req.method === 'GET' || req.method === 'POST') &&
    req.url === '/guestBook.html'
  )
    return giveGuestBook;
  if (req.method === 'GET') return serveFile;
  return () => new Response();
};

const processRequest = req => {
  const handler = findHandler(req);
  return handler(req);
};

module.exports = { processRequest };
