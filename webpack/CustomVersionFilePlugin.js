const fs = require('fs');
const path = require('path');
const APP_VERSION = require('../package.json').version;

/**
 * Simple webpack plugin that writes the app version (from package.json) and the webpack hash to './version.json'
 */
class CustomVersionFilePlugin {
    apply(compiler) {
        compiler.hooks.done.tap(this.constructor.name, stats => new Promise((resolve, reject) => {
            const json = JSON.stringify({
                appVersion: APP_VERSION,
                buildHash: stats.hash,
            });
            fs.writeFile(path.join(__dirname, '../dist/version.json'), json, 'utf8', (err) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve();
            });
        }));
    }
}

module.exports = CustomVersionFilePlugin;
