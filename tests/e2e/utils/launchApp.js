/* eslint-disable rulesdir/prefer-underscore-method */
import config from '../config';
import execAsync from './execAsync';

export default function (platform = 'android', packageName = config.APP_PACKAGE, activityPath = config.ACTIVITY_PATH, launchArgs = {}) {
    if (platform !== 'android') {
        throw new Error(`launchApp() missing implementation for platform: ${platform}`);
    }

    // Use adb to start the app
    const launchArgsString = Object.keys(launchArgs)
        .map((key) => `${typeof launchArgs[key] === 'boolean' ? '--ez' : '--es'} ${key} ${launchArgs[key]}`)
        .join(' ');
    return execAsync(`adb shell am start -n ${packageName}/${activityPath} ${launchArgsString}`);
}
