import execAsync from './execAsync';
import type {PromiseWithAbort} from './execAsync';

const closeANRPopup = function (platform = 'android'): PromiseWithAbort {
    if (platform !== 'android') {
        throw new Error(`closeANRPopup() missing implementation for platform: ${platform}`);
    }

    // Press "Enter" to close the ANR popup
    return execAsync(`adb shell input keyevent KEYCODE_ENTER`);
};

export default closeANRPopup;
