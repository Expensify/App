import {Platform} from 'react-native';
import CONST from '../CONST';

/**
 * Reads the current operating system.
 * @return {String | null}
 */
function getOperatingSystem() {
    // When running on a native device
    if (!window || !window.navigator || !window.navigator.platform) {
        switch (Platform.OS) {
            case 'ios':
                return CONST.OS.IOS;
            case 'android':
                return CONST.OS.ANDROID;
            default:
                return CONST.OS.NATIVE;
        }
    }

    // When running on web, we can check window.navigator
    const {userAgent, platform} = window.navigator;
    const macosPlatforms = ['Macintosh', 'MacIntel', 'MacPPC', 'Mac68K'];
    const windowsPlatforms = ['Win32', 'Win64', 'Windows', 'WinCE'];
    const iosPlatforms = ['iPhone', 'iPad', 'iPod'];

    let os = null;
    if (macosPlatforms.includes(platform)) {
        os = CONST.OS.MAC_OS;
    } else if (iosPlatforms.includes(platform)) {
        os = CONST.OS.IOS;
    } else if (windowsPlatforms.includes(platform)) {
        os = CONST.OS.WINDOWS;
    } else if (/Android/.test(userAgent)) {
        os = CONST.OS.ANDROID;
    } else if (/Linux/.test(platform)) {
        os = CONST.OS.LINUX;
    }
    return os;
}

export default getOperatingSystem;
