import _ from 'underscore';
import CONST from '../../CONST';

/**
 * Reads the current operating system when running on Web/Mobile-Web/Desktop
 * @return {String | null}
 */
export default () => {
    const {userAgent, platform} = window.navigator;
    const macosPlatforms = ['Macintosh', 'MacIntel', 'MacPPC', 'Mac68K'];
    const windowsPlatforms = ['Win32', 'Win64', 'Windows', 'WinCE'];
    const iosPlatforms = ['iPhone', 'iPad', 'iPod'];

    let os = null;
    if (_.contains(macosPlatforms, platform)) {
        os = CONST.OS.MAC_OS;
    } else if (_.contains(iosPlatforms, platform)) {
        os = CONST.OS.IOS;
    } else if (_.contains(windowsPlatforms, platform)) {
        os = CONST.OS.WINDOWS;
    } else if (/Android/.test(userAgent)) {
        os = CONST.OS.ANDROID;
    } else if (/Linux/.test(platform)) {
        os = CONST.OS.LINUX;
    }
    return os;
};
