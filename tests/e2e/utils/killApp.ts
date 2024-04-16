import config from '../config';
import execAsync from './execAsync';
import type {PromiseWithAbort} from './execAsync';

const killApp = function (platform = 'android', packageName = config.MAIN_APP_PACKAGE): PromiseWithAbort {
    if (platform !== 'android') {
        throw new Error(`killApp() missing implementation for platform: ${platform}`);
    }

    // Use adb to kill the app
    return execAsync(`adb shell am force-stop ${packageName}`);
};

export default killApp;
