"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetIsOpeningRouteInDesktop = exports.isOpeningRouteInDesktop = exports.openRouteInDesktopApp = exports.isChromeIOS = exports.isMobileChrome = exports.isModernSafari = exports.isSafari = exports.isMobileWebKit = exports.isMobileSafari = exports.isMobileIOS = exports.isMobile = exports.getBrowser = void 0;
var CONFIG_1 = require("@src/CONFIG");
var CONST_1 = require("@src/CONST");
var ROUTES_1 = require("@src/ROUTES");
var isOpenRouteInDesktop = false;
/**
 * Fetch browser name from UA string
 *
 */
var getBrowser = function () {
    var _a;
    var userAgent = window.navigator.userAgent;
    var match = (_a = userAgent.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))/i)) !== null && _a !== void 0 ? _a : [];
    var temp;
    var browserName = '';
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
    return browserName ? browserName.toLowerCase() : CONST_1.default.BROWSER.OTHER;
};
exports.getBrowser = getBrowser;
/**
 * Whether the platform is a mobile browser.
 * https://developer.mozilla.org/en-US/docs/Web/HTTP/Browser_detection_using_the_user_agent
 *
 */
var isMobile = function () { return /Android|webOS|iPhone|iPad|iPod|BlackBerry|BB|PlayBook|IEMobile|Windows Phone|Silk|Opera Mini/i.test(navigator.userAgent); };
exports.isMobile = isMobile;
var isMobileIOS = function () {
    var userAgent = navigator.userAgent;
    return /iP(ad|od|hone)/i.test(userAgent);
};
exports.isMobileIOS = isMobileIOS;
/**
 * Checks if requesting user agent is Safari browser on a mobile device
 *
 */
var isMobileSafari = function () {
    var userAgent = navigator.userAgent;
    return /iP(ad|od|hone)/i.test(userAgent) && /WebKit/i.test(userAgent) && !/(CriOS|FxiOS|OPiOS|mercury)/i.test(userAgent);
};
exports.isMobileSafari = isMobileSafari;
/**
 * Checks if requesting user agent is Chrome browser on a mobile device
 *
 */
var isMobileChrome = function () {
    var userAgent = navigator.userAgent;
    return /Android/i.test(userAgent) && /chrome|chromium|crios/i.test(userAgent);
};
exports.isMobileChrome = isMobileChrome;
/**
 * Checks if the requesting user agent is a WebKit-based browser on an iOS mobile device.
 */
var isMobileWebKit = function () {
    var userAgent = navigator.userAgent;
    return /iP(ad|od|hone)/i.test(userAgent) && /WebKit/i.test(userAgent);
};
exports.isMobileWebKit = isMobileWebKit;
/**
 * Checks if the requesting user agent is a Chrome browser on an iOS mobile device.
 */
var isChromeIOS = function () {
    var userAgent = navigator.userAgent;
    return /iP(ad|od|hone)/i.test(userAgent) && /CriOS/i.test(userAgent);
};
exports.isChromeIOS = isChromeIOS;
var isSafari = function () { return getBrowser() === 'safari' || isMobileSafari(); };
exports.isSafari = isSafari;
/**
 * Checks if the requesting user agent is a modern version of Safari on iOS (version 18 or higher).
 */
var isModernSafari = function () {
    var version = navigator.userAgent.match(/OS (\d+_\d+)/);
    var iosVersion = version ? version[1].replace('_', '.') : '';
    return parseFloat(iosVersion) >= 18;
};
exports.isModernSafari = isModernSafari;
/**
 * The session information needs to be passed to the Desktop app, and the only way to do that is by using query params. There is no other way to transfer the data.
 */
var openRouteInDesktopApp = function (shortLivedAuthToken, email, initialRoute) {
    if (shortLivedAuthToken === void 0) { shortLivedAuthToken = ''; }
    if (email === void 0) { email = ''; }
    if (initialRoute === void 0) { initialRoute = ''; }
    var params = new URLSearchParams();
    // If the user is opening the desktop app through a third party signin flow, we need to manually add the exitTo param
    // so that the desktop app redirects to the correct home route after signin is complete.
    var openingFromDesktopRedirect = window.location.pathname === "/".concat(ROUTES_1.default.DESKTOP_SIGN_IN_REDIRECT);
    params.set('exitTo', "".concat(openingFromDesktopRedirect ? '/r' : initialRoute || window.location.pathname).concat(window.location.search).concat(window.location.hash));
    if (email && shortLivedAuthToken) {
        params.set('email', email);
        params.set('shortLivedAuthToken', shortLivedAuthToken);
    }
    var expensifyUrl = new URL(CONFIG_1.default.EXPENSIFY.NEW_EXPENSIFY_URL);
    var expensifyDeeplinkUrl = "".concat(CONST_1.default.DEEPLINK_BASE_URL).concat(expensifyUrl.host, "/transition?").concat(params.toString());
    var browser = getBrowser();
    // This check is necessary for Safari, otherwise, if the user
    // does NOT have the Expensify desktop app installed, it's gonna
    // show an error in the page saying that the address is invalid.
    // It is also necessary for Firefox, otherwise the window.location.href redirect
    // will abort the fetch request from NetInfo, which will cause the app to go offline temporarily.
    if (browser === CONST_1.default.BROWSER.SAFARI || browser === CONST_1.default.BROWSER.FIREFOX) {
        var iframe_1 = document.createElement('iframe');
        iframe_1.style.display = 'none';
        document.body.appendChild(iframe_1);
        if (iframe_1.contentWindow) {
            iframe_1.contentWindow.location.href = expensifyDeeplinkUrl;
        }
        // Since we're creating an iframe for Safari to handle deeplink,
        // we need to give Safari some time to open the pop-up window.
        // After that we can just remove the iframe.
        setTimeout(function () {
            document.body.removeChild(iframe_1);
        }, 0);
    }
    else {
        isOpenRouteInDesktop = true;
        window.location.href = expensifyDeeplinkUrl;
    }
};
exports.openRouteInDesktopApp = openRouteInDesktopApp;
var isOpeningRouteInDesktop = function () {
    return isOpenRouteInDesktop;
};
exports.isOpeningRouteInDesktop = isOpeningRouteInDesktop;
var resetIsOpeningRouteInDesktop = function () {
    isOpenRouteInDesktop = false;
};
exports.resetIsOpeningRouteInDesktop = resetIsOpeningRouteInDesktop;
