import CONST from '../../CONST';
import CONFIG from '../../CONFIG';

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
    return /iP(ad|od|hone)/i.test(userAgent) && /WebKit/i.test(userAgent) && !/(CriOS|FxiOS|OPiOS|mercury)/i.test(userAgent);
}

/**
 * Checks if requesting user agent is Chrome browser on a mobile device
 *
 * @returns {Boolean}
 */
function isMobileChrome() {
    const userAgent = navigator.userAgent;
    return /Android/i.test(userAgent) && /chrome|chromium|crios/i.test(userAgent);
}

function isSafari() {
    return getBrowser() === 'safari' || isMobileSafari();
}

/**
 * The session information needs to be passed to the Desktop app, and the only way to do that is by using query params. There is no other way to transfer the data.
 * @param {String} shortLivedAuthToken
 * @param {String} email
 */
function openRouteInDesktopApp(shortLivedAuthToken = '', email = '') {
    const params = new URLSearchParams();
    params.set('exitTo', `${window.location.pathname}${window.location.search}${window.location.hash}`);
    if (email && shortLivedAuthToken) {
        params.set('email', email);
        params.set('shortLivedAuthToken', shortLivedAuthToken);
    }
    const expensifyUrl = new URL(CONFIG.EXPENSIFY.NEW_EXPENSIFY_URL);
    const expensifyDeeplinkUrl = `${CONST.DEEPLINK_BASE_URL}${expensifyUrl.host}/transition?${params.toString()}`;

    const browser = getBrowser();

    // This check is necessary for Safari, otherwise, if the user
    // does NOT have the Expensify desktop app installed, it's gonna
    // show an error in the page saying that the address is invalid.
    // It is also necessary for Firefox, otherwise the window.location.href redirect
    // will abort the fetch request from NetInfo, which will cause the app to go offline temporarily.
    if (browser === CONST.BROWSER.SAFARI || browser === CONST.BROWSER.FIREFOX) {
        const iframe = document.createElement('iframe');
        iframe.style.display = 'none';
        document.body.appendChild(iframe);
        iframe.contentWindow.location.href = expensifyDeeplinkUrl;

        // Since we're creating an iframe for Safari to handle deeplink,
        // we need to give Safari some time to open the pop-up window.
        // After that we can just remove the iframe.
        setTimeout(() => {
            document.body.removeChild(iframe);
        }, 0);
    } else {
        window.location.href = expensifyDeeplinkUrl;
    }
}

export {getBrowser, isMobile, isMobileSafari, isSafari, isMobileChrome, openRouteInDesktopApp};
