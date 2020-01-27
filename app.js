const fs = require('fs');
const Response = require('./lib/response');
const oldComments = require('./public/documents/comments.json');
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

const generateGuestBook = allComments => {
  const html = loadTemplate('guestBook.html', allComments);
  const res = new Response();
  res.setHeader('Content-Type', CONTENT_TYPES.html);
  res.setHeader('Content-Length', html.length);
  res.statusCode = 200;
  res.body = html;
  return res;
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
  return generateGuestBook({ comment: html });
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
  if (req.method === 'GET' && req.url === '/guestBook.html')
    return giveGuestBook;
  if (req.method === 'GET') return serveFile;
  if (req.method === 'POST') {
    return giveGuestBook;
  }
  return () => new Response();
};

const processRequest = req => {
  const handler = findHandler(req);
  return handler(req);
};

module.exports = { processRequest };
