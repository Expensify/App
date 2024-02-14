import {MAIN_APP_PACKAGE} from '../config';
import execAsync from './execAsync';

type KillApp = (platform: string, packageName: string) => Promise<void>;

const killApp: KillApp = function (platform = 'android', packageName = MAIN_APP_PACKAGE) {
    if (platform !== 'android') {
        throw new Error(`killApp() missing implementation for platform: ${platform}`);
    }

    // Use adb to kill the app
    return execAsync(`adb shell am force-stop ${packageName}`);
};

export default killApp;
