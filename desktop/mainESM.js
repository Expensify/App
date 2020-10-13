/**
 * This file enables us to import our source code (ES6 modules) into desktop/index.js
 * It's required because Electron uses node.js, which is build using the CommonJS module system, not ES6 modules.
 *
 * As a workaround, we're using the ESM library https://www.npmjs.com/package/esm
 * to allow us to `require` ES6 modules in a CommonJS environment.
 *
 * It's also worth noting that node.js v14 has experimental support for ESM out-of-the-box: https://nodejs.org/docs/latest-v14.x/api/esm.html
 * Once this feature becomes stable and is released as part of a LTS node.js version, AND Electron adopts this node version,
 * then we can remove this wrapper file and remove ESM as one of our dependencies. Probably early-to-mid 2021.
 *
 * We can follow this issue https://github.com/electron/electron/issues/21457 for updates.
 */

// eslint-disable-next-line no-global-assign
require = require('esm')(module);
module.exports = require('./main.js');
