import type * as FS from 'fs';
import type {Compiler} from 'webpack';

const fs = require('fs') as typeof FS;
const path = require('path');
const APP_VERSION = require('../../package.json').version;

/**
 * Simple webpack plugin that writes the app version (from package.json) and the webpack hash to './version.json'
 */
class CustomVersionFilePlugin {
    apply(compiler: Compiler) {
        compiler.hooks.done.tap(this.constructor.name, () => {
            const versionPath = path.join(__dirname, '/../../dist/version.json');
            fs.mkdir(path.dirname(versionPath), {recursive: true}, (dirErr) => {
                if (dirErr) {
                    return;
                }
                fs.writeFile(versionPath, JSON.stringify({version: APP_VERSION}), {encoding: 'utf8'}, () => {});
            });
        });
    }
}

export default CustomVersionFilePlugin;
