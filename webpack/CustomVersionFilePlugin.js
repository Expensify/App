const fs = require('fs');
const APP_VERSION = require('../package.json').version;

/**
 * Simple webpack plugin that writes the app version (from package.json) and the webpack hash to './version.json'
 */
export default class CustomVersionFilePlugin {
    apply(compiler) {
        compiler.hooks.done.tap(this.constructor.name, stats => new Promise((resolve, reject) => {
            const json = JSON.stringify({
                appVersion: APP_VERSION,
                buildHash: stats.hash,
            });
            fs.writeFile('./version.json', json, 'utf8', (err) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve();
            });
        }));
    }
}
