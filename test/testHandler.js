const request = require('supertest');
const { app } = require('../httpHandlers');

describe('GET method ', () => {
  describe('static file', () => {
    it('should give the index.html page when the url is /', done => {
      request(app.serve.bind(app))
        .get('/')
        .expect('Content-Type', 'text/html')
        .expect(200, done)
        .expect(/jar/);
    });
  });
  describe('flower template file', () => {
    it('should give the Abeliophyllum page when the url is /Abeliophyllum', done => {
      request(app.serve.bind(app))
        .get('/Abeliophyllum')
        .expect('Content-Type', 'text/html')
        .expect(200, done)
        .expect(/Abeliophyllum/);
    });
    it('should give the Agerantum page when the url is /Agerantum', done => {
      request(app.serve.bind(app))
        .get('/Agerantum')
        .expect('Content-Type', 'text/html')
        .expect(200, done)
        .expect(/Agerantum/);
    });
  });
  describe('guest Book template file', () => {
    it('should give the guestBook page when the url is /guestBook', done => {
      request(app.serve.bind(app))
        .get('/guestBook')
        .expect('Content-Type', 'text/html')
        .expect(200, done)
        .expect(/Guest Book/);
    });
  });
});
