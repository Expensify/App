import config from '../config';
import {getPage, setPage} from './browser';
import execAsync from './execAsync';
import type {PromiseWithAbort} from './execAsync';

const killApp = function (platform = 'android', packageName = config.MAIN_APP_PACKAGE): PromiseWithAbort {
    if (platform !== 'android' && platform !== 'web') {
        throw new Error(`killApp() missing implementation for platform: ${platform}`);
    }

    if (platform === 'web') {
        const page = getPage(packageName);

        if (page) {
            setPage(null, packageName);
            // TODO: can `page` be `null` here? theoretically not, but it's better to check :)
            return page.close();
        }

        return Promise.resolve();
    }

    // Use adb to kill the app
    return execAsync(`adb shell am force-stop ${packageName}`);
};

export default killApp;
