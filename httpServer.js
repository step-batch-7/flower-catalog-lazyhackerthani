const http = require('http');
const { app } = require('./httpHandlers');

const server = new http.Server(app.serve.bind(app));

server.listen(4000, () => console.log('listening to 4000'));
