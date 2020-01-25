const hideIt = function() {
  document.getElementById('flowerJar').classList.add('hide');
  setTimeout(
    () => document.getElementById('flowerJar').classList.remove('hide'),
    1000
  );
};
