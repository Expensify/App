import config from '../config';
import execAsync from './execAsync';

export default function (platform = 'android', packageName = config.APP_PACKAGE) {
    if (platform !== 'android') {
        throw new Error(`killApp() missing implementation for platform: ${platform}`);
    }

    // Use adb to kill the app
    return execAsync(`adb shell am force-stop ${packageName}`);
}
