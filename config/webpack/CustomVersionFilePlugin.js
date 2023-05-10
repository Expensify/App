const fs = require('fs');
const path = require('path');
const APP_VERSION = require('../../package.json').version;

/**
 * Simple webpack plugin that writes the app version (from package.json) and the webpack hash to './version.json'
 */
class CustomVersionFilePlugin {
    apply(compiler) {
        compiler.hooks.done.tap(this.constructor.name, () => new Promise((resolve, reject) => {
            const versionPath = path.join(__dirname, '/../../dist/version.json');
            fs.mkdir(path.dirname(versionPath), {recursive: true}, (dirErr) => {
                if (dirErr) {
                    reject(dirErr);
                    return;
                }
                fs.writeFile(versionPath,
                    JSON.stringify({version: APP_VERSION}),
                    'utf8',
                    (fileErr) => {
                        if (fileErr) {
                            reject(fileErr);
                            return;
                        }
                        resolve();
                    });
            });
        }));
    }
}

module.exports = CustomVersionFilePlugin;
