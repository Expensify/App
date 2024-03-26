import fs from 'fs';
import path from 'path';
import type {Compiler} from 'webpack';
import {version as APP_VERSION} from '../../package.json';

/**
 * Simple webpack plugin that writes the app version (from package.json) and the webpack hash to './version.json'
 */
class CustomVersionFilePlugin {
    apply(compiler: Compiler) {
        compiler.hooks.done.tap(this.constructor.name, () => {
            const versionPath = path.join(__dirname, '/../../dist/version.json');
            fs.mkdir(path.dirname(versionPath), {recursive: true}, (directoryError) => {
                if (directoryError) {
                    throw directoryError;
                }
                fs.writeFile(versionPath, JSON.stringify({version: APP_VERSION}), {encoding: 'utf8'}, (error) => {
                    if (!error) {
                        return;
                    }
                    throw error;
                });
            });
        });
    }
}

export default CustomVersionFilePlugin;
