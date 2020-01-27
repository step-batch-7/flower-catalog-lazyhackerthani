const characters = [
  [' ', '+'],
  ['\n', '%0D%0A'],
  [';', '%3B'],
  ['?', '%3F'],
  ['/', '%2F'],
  [':', '%3A'],
  ['#', '%23'],
  ['&', '%26'],
  ['=', '%3D'],
  ['+', '%2B'],
  [',', '%2C'],
  ['$', '%24'],
  ['%', '%25'],
  ['<', '%3C'],
  ['>', '%3E'],
  ['~', '%7E'],
  ['%', '%25'],
  ['$', '%24']
];

const replaceText = function(encodedText) {
  let replacedText = encodedText;
  characters.forEach(([actualChar, code]) => {
    replacedText = replacedText.split(code).join(actualChar);
  });
  return replacedText;
};

module.exports = { replaceText };
