const fs = require('fs');

const { App } = require('./httpApp');
const { loadTemplate } = require('./lib/viewTemplate');

const MIME_TYPES = {
  txt: 'text/plain',
  html: 'text/html',
  css: 'text/css',
  js: 'application/javascript',
  json: 'application/json',
  gif: 'image/gif',
  jpg: 'image/jpeg',
  pdf: 'application/pdf'
};

const serveStaticPage = function(req, res, next) {
  const publicFolder = `${__dirname}/public`;
  const path = req.url === '/' ? '/index.html' : req.url;
  const absolutePath = publicFolder + path;
  const stat = fs.existsSync(absolutePath) && fs.statSync(absolutePath);
  if (!stat || !stat.isFile()) {
    next();
    return;
  }
  const content = fs.readFileSync(absolutePath);
  const extension = path.split('.').pop();
  res.setHeader('Content-Type', MIME_TYPES[extension]);
  res.end(content);
};

const notFound = function(req, res) {
  res.writeHead(404);
  res.end('Not Found');
};
////

const giveFlowerPage = (req, res, next) => {
  const flowerList = ['Abeliophyllum', 'Agerantum'];
  const documentFolder = `${__dirname}/public/documents`;
  const flowerName = `${req.url.slice(1)}`;
  if (!flowerList.some(allowedFlower => flowerName === allowedFlower)) {
    next();
    return;
  }
  const description = fs.readFileSync(
    `${documentFolder}/${flowerName}.txt`,
    'utf8'
  );
  const content = loadTemplate('flower.html', { flowerName, description });
  res.setHeader('Content-Type', MIME_TYPES.html);
  res.end(content);
};

const giveGuestBook = function(req, res, next) {
  if (req.url === 'guestBook') {
    next();
    return;
  }
  const oldComments = JSON.parse(
    fs.readFileSync('./public/documents/comments.json', 'utf8')
  );
  let html = '';
  oldComments.forEach(commentDetail => {
    html += `<div class="commentBox"> ${commentDetail.name} ( ${new Date(
      commentDetail.time
    )} ) : ${commentDetail.comment}</div>`;
  });
  const content = loadTemplate('guestBook.html', { comment: html });
  res.setHeader('Content-Type', MIME_TYPES.html);
  res.end(content);
};

const decodeUriText = function(encodedText) {
  return decodeURIComponent(encodedText.replace(/\+/g, ' '));
};

const pickupParams = (query, keyValue) => {
  const [key, value] = keyValue.split('=');
  query[key] = decodeUriText(value);
  return query;
};

const addComment = (req, res) => {
  const oldComments = JSON.parse(
    fs.readFileSync('./public/documents/comments.json', 'utf8')
  );
  const body = req.body.split('&').reduce(pickupParams, {});
  const commentDetails = {
    name: body.name,
    comment: body.comment,
    time: new Date()
  };
  oldComments.unshift(commentDetails);
  fs.writeFileSync(
    './public/documents/comments.json',
    JSON.stringify(oldComments),
    'utf8'
  );

  res.setHeader('location', 'guestBook');
  res.writeHead(301);
  res.end();
};
////
const methodNotAllowed = function(req, res) {
  res.writeHead(400, 'Method Not Allowed');
  res.end();
};

const readBody = function(req, res, next) {
  let data = '';
  req.on('data', chunk => (data += chunk));
  req.on('end', () => {
    req.body = data;
    next();
  });
};

const app = new App();

app.use(readBody);

app.get('', serveStaticPage);

app.get('', giveFlowerPage);

app.get('guestBook', giveGuestBook);

app.get('', notFound);
app.post('guestBook', addComment);
app.post('', notFound);
app.use(methodNotAllowed);

module.exports = { app };
