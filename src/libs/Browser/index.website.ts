import getOSAndName from '@libs/actions/Device/getDeviceInfo/getOSAndName';
import CONST from '@src/CONST';
import type {GetBrowser, IsChromeIOS, IsMobile, IsMobileChrome, IsMobileIOS, IsMobileSafari, IsMobileWebKit, IsModernSafari, IsSafari} from './types';

/**
 * Fetch browser name from UA string
 *
 */
const getBrowser: GetBrowser = () => {
    const {userAgent} = window.navigator;
    const match = userAgent.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))/i) ?? [];
    let temp: RegExpMatchArray | null;
    let browserName = '';

    if (/trident/i.test(match[1])) {
        return 'IE';
    }

    if (match[1] && match[1].toLowerCase() === 'chrome') {
        temp = userAgent.match(/\b(OPR)/);
        if (temp !== null) {
            return 'Opera';
        }

        temp = userAgent.match(/\b(Edg)/);
        if (temp !== null) {
            return 'Edge';
        }
    }

    browserName = match[1];
    return browserName ? browserName.toLowerCase() : CONST.BROWSER.OTHER;
};

/**
 * Whether the platform is a mobile browser.
 * https://developer.mozilla.org/en-US/docs/Web/HTTP/Browser_detection_using_the_user_agent
 *
 */
const isMobile: IsMobile = () => /Android|webOS|iPhone|iPad|iPod|BlackBerry|BB|PlayBook|IEMobile|Windows Phone|Silk|Opera Mini/i.test(navigator.userAgent);

const isMobileIOS: IsMobileIOS = () => {
    const userAgent = navigator.userAgent;
    return /iP(ad|od|hone)/i.test(userAgent);
};

/**
 * Checks if requesting user agent is Safari browser on a mobile device
 *
 */
const isMobileSafari: IsMobileSafari = () => {
    const userAgent = navigator.userAgent;
    return /iP(ad|od|hone)/i.test(userAgent) && /WebKit/i.test(userAgent) && !/(CriOS|FxiOS|OPiOS|mercury)/i.test(userAgent);
};

/**
 * Checks if requesting user agent is Chrome browser on a mobile device
 *
 */
const isMobileChrome: IsMobileChrome = () => {
    const userAgent = navigator.userAgent;
    return /Android/i.test(userAgent) && /chrome|chromium|crios/i.test(userAgent);
};

/**
 * Checks if the requesting user agent is a WebKit-based browser on an iOS mobile device.
 */
const isMobileWebKit: IsMobileWebKit = () => {
    const userAgent = navigator.userAgent;
    return /iP(ad|od|hone)/i.test(userAgent) && /WebKit/i.test(userAgent);
};

/**
 * Checks if the requesting user agent is a Chrome browser on an iOS mobile device.
 */
const isChromeIOS: IsChromeIOS = () => {
    const userAgent = navigator.userAgent;
    return /iP(ad|od|hone)/i.test(userAgent) && /CriOS/i.test(userAgent);
};

const isSafari: IsSafari = () => getBrowser() === 'safari' || isMobileSafari();

/**
 * Checks if the requesting user agent is a modern version of Safari on iOS (version 18 or higher).
 */
const isModernSafari: IsModernSafari = (): boolean => {
    const version = navigator.userAgent.match(/OS (\d+_\d+)/);
    const iosVersion = version ? version[1].replace('_', '.') : '';

    return parseFloat(iosVersion) >= 18;
};

const isMobileSafariOnIos26: IsModernSafari = (): boolean => {
    return isMobileSafari() && getOSAndName().osVersion === '26';
};

export {getBrowser, isMobile, isMobileIOS, isMobileSafari, isMobileWebKit, isSafari, isModernSafari, isMobileChrome, isChromeIOS, isMobileSafariOnIos26};
