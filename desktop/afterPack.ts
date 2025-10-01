import {promises as fs} from 'node:fs';
import path from 'node:path';
import type {AfterPackContext} from 'electron-builder';

const getAssetSourceFilename = () => {
    if (process.env.ELECTRON_ENV === 'adhoc') {
        return 'Assets-adhoc.car';
    }

    if (process.env.ELECTRON_ENV === 'development') {
        return 'Assets-dev.car';
    }

    return 'Assets.car';
};

const assetSource = path.resolve(__dirname, `./${getAssetSourceFilename()}`);

// This will copy Assets.car with MacOS Liquid Glass icon
// and will be removed after Electron builder supports this natively
export default function afterPack(context: AfterPackContext) {
    if (context.electronPlatformName !== 'darwin') {
        return Promise.resolve();
    }

    const appName = context?.packager?.appInfo.productFilename;
    const appRoot = path.join(context.appOutDir, `${appName}.app`, 'Contents');
    const resourcesDir = path.join(appRoot, 'Resources');

    return fs.mkdir(resourcesDir, {recursive: true}).then(() => fs.copyFile(assetSource, path.join(resourcesDir, 'Assets.car')));
}
