import config from '../config';
import execAsync from './execAsync';

const killApp = function (platform = 'android', packageName = config.MAIN_APP_PACKAGE): Promise<void> {
    if (platform !== 'android') {
        throw new Error(`killApp() missing implementation for platform: ${platform}`);
    }

    // Use adb to kill the app
    return execAsync(`adb shell am force-stop ${packageName}`);
};

export default killApp;
