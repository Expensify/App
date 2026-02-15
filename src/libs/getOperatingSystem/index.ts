import CONST from '@src/CONST';
import type GetOperatingSystem from './types';

/**
 * Reads the current operating system when running on Web/Mobile-Web
 */
const getOperatingSystem: GetOperatingSystem = () => {
    // eslint-disable-next-line @typescript-eslint/no-deprecated
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
};

export default getOperatingSystem;
