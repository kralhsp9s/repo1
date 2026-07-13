const { join } = require('path');

/**
 * @type {import("puppeteer").Configuration}
 */
module.exports = {
  // Puppeteer'a Chrome'u gizli sistem klasörlerine değil, 
  // projenin tam içine (.cache klasörüne) indirmesini söylüyoruz.
  cacheDirectory: join(__dirname, '.cache', 'puppeteer'),
};
