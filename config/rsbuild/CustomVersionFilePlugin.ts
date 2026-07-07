import type {Compiler} from '@rspack/core';

import fs from 'fs';
import path from 'path';

import packageJson from '../../package.json' with {type: 'json'};

const APP_VERSION = packageJson.version;

/**
 * Custom rspack plugin that writes the app version (from package.json) and the rspack hash to './version.json'
 */
class CustomVersionFilePlugin {
    apply(compiler: Compiler) {
        compiler.hooks.done.tap(this.constructor.name, () => {
            const versionPath = path.join(__dirname, '/../../dist/version.json');

            fs.promises
                .mkdir(path.dirname(versionPath), {recursive: true})
                .then(() => fs.promises.readFile(versionPath, 'utf8'))
                .then((existingVersion) => {
                    const {version} = JSON.parse(existingVersion) as {version: string};

                    if (version !== APP_VERSION) {
                        fs.promises.writeFile(versionPath, JSON.stringify({version: APP_VERSION}), 'utf8');
                    }
                })
                .catch((err: NodeJS.ErrnoException) => {
                    if (err.code === 'ENOENT') {
                        // if file doesn't exist
                        fs.promises.writeFile(versionPath, JSON.stringify({version: APP_VERSION}), 'utf8');
                    } else {
                        throw err;
                    }
                });
        });
    }
}

export default CustomVersionFilePlugin;
