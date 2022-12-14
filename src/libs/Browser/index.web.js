import CONST from '../../CONST';

/**
 * Fetch browser name from UA string
 *
 * @return {String} e.g. Chrome
 */
function getBrowser() {
    const {userAgent} = window.navigator;
    let match = userAgent.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))/i) || [];
    let temp;

    if (/trident/i.test(match[1])) {
        return 'IE';
    }

    if (match[1] && (match[1].toLowerCase() === 'chrome')) {
        temp = userAgent.match(/\b(OPR)/);
        if (temp !== null) {
            return 'Opera';
        }

        temp = userAgent.match(/\b(Edg)/);
        if (temp !== null) {
            return 'Edge';
        }
    }

    match = match[1] ? match[1] : navigator.appName;
    return match ? match.toLowerCase() : CONST.BROWSER.OTHER;
}

/**
 * Whether the platform is a mobile browser.
 * https://developer.mozilla.org/en-US/docs/Web/HTTP/Browser_detection_using_the_user_agent
 *
 * @returns {Boolean}
 */
function isMobile() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|BB|PlayBook|IEMobile|Windows Phone|Silk|Opera Mini/i.test(navigator.userAgent);
}

/**
 * Checks if requesting user agent is Safari browser on a mobile device
 *
 * @returns {Boolean}
 */
function isMobileSafari() {
    const userAgent = navigator.userAgent;
    return /iP(ad|od|hone)/i.test(userAgent) && /WebKit/i.test(userAgent) && !(/(CriOS|FxiOS|OPiOS|mercury)/i.test(userAgent));
}

/**
 * @returns {boolean}
 */
function isInternetExplorer() {
    return Boolean(window.document.documentMode);
}

export {
    getBrowser,
    isMobile,
    isMobileSafari,
    isInternetExplorer,
};
