/* eslint-disable rulesdir/prefer-underscore-method */
import {ACTIVITY_PATH, MAIN_APP_PACKAGE} from '../config';
import execAsync from './execAsync';

const launchApp = (platform = 'android', packageName = MAIN_APP_PACKAGE, activityPath = ACTIVITY_PATH, launchArgs: Record<string, boolean> = {}) => {
    if (platform !== 'android') {
        throw new Error(`launchApp() missing implementation for platform: ${platform}`);
    }

    // Use adb to start the app
    const launchArgsString = Object.keys(launchArgs)
        .map((key) => `${typeof launchArgs[key] === 'boolean' ? '--ez' : '--es'} ${key} ${launchArgs[key]}`)
        .join(' ');
    return execAsync(`adb shell am start -n ${packageName}/${activityPath} ${launchArgsString}`);
};

export default launchApp;
