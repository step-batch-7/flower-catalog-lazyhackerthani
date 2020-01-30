const errorCodes = { notFound: 404 };
class Response {
  constructor(statusCode = errorCodes.notFound, body = {}) {
    this.statusCode = statusCode;
    this.body = body;
    this.headers = [{ key: 'Content-Length', value: 0 }];
  }
  setHeader(key, value) {
    const header = this.headers.find(head => head.key === key);
    if (header) {
      header.value = value;
    } else {
      this.headers.push({ key, value });
    }
  }
  generateHeadersText() {
    const lines = this.headers.map(header => `${header.key}: ${header.value}`);
    return lines.join('\r\n');
  }
  writeTo(writable) {
    writable.write(`HTTP/1.1 ${this.statusCode}\r\n`);
    writable.write(this.generateHeadersText());
    writable.write('\r\n\r\n');
    this.body && writable.write(this.body);
  }
}
module.exports = Response;
