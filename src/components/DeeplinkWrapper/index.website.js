"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var expensify_common_1 = require("expensify-common");
var react_1 = require("react");
var useOnyx_1 = require("@hooks/useOnyx");
var Browser_1 = require("@libs/Browser");
var currentUrl_1 = require("@libs/Navigation/currentUrl");
var shouldPreventDeeplinkPrompt_1 = require("@libs/Navigation/helpers/shouldPreventDeeplinkPrompt");
var Navigation_1 = require("@libs/Navigation/Navigation");
var navigationRef_1 = require("@libs/Navigation/navigationRef");
var Url_1 = require("@libs/Url");
var App_1 = require("@userActions/App");
var Link_1 = require("@userActions/Link");
var Session_1 = require("@userActions/Session");
var CONFIG_1 = require("@src/CONFIG");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var ROUTES_1 = require("@src/ROUTES");
function isMacOSWeb() {
    return !(0, Browser_1.isMobile)() && typeof navigator === 'object' && typeof navigator.userAgent === 'string' && /Mac/i.test(navigator.userAgent) && !/Electron/i.test(navigator.userAgent);
}
function promptToOpenInDesktopApp(currentUserAccountID, initialUrl) {
    if (initialUrl === void 0) { initialUrl = ''; }
    // If the current url path is /transition..., meaning it was opened from oldDot, during this transition period:
    // 1. The user session may not exist, because sign-in has not been completed yet.
    // 2. There may be non-idempotent operations (e.g. create a new workspace), which obviously should not be executed again in the desktop app.
    // So we need to wait until after sign-in and navigation are complete before starting the deeplink redirect.
    if (expensify_common_1.Str.startsWith(window.location.pathname, expensify_common_1.Str.normalizeUrl(ROUTES_1.default.TRANSITION_BETWEEN_APPS))) {
        var params = new URLSearchParams(window.location.search);
        // If the user is redirected from the desktop app, don't prompt the user to open in desktop.
        if (params.get('referrer') === 'desktop') {
            return;
        }
        (0, App_1.beginDeepLinkRedirectAfterTransition)();
    }
    else {
        // Match any magic link (/v/<account id>/<6 digit code>)
        var isMagicLink = CONST_1.default.REGEX.ROUTES.VALIDATE_LOGIN.test(window.location.pathname);
        var shouldAuthenticateWithCurrentAccount = !isMagicLink || (isMagicLink && !!currentUserAccountID && window.location.pathname.includes(currentUserAccountID.toString()));
        (0, App_1.beginDeepLinkRedirect)(shouldAuthenticateWithCurrentAccount, isMagicLink, (0, Link_1.getInternalNewExpensifyPath)(initialUrl));
    }
}
function DeeplinkWrapper(_a) {
    var children = _a.children, isAuthenticated = _a.isAuthenticated, autoAuthState = _a.autoAuthState, initialUrl = _a.initialUrl;
    var _b = (0, react_1.useState)(), currentScreen = _b[0], setCurrentScreen = _b[1];
    var _c = (0, react_1.useState)(false), hasShownPrompt = _c[0], setHasShownPrompt = _c[1];
    var removeListener = (0, react_1.useRef)(undefined);
    var isActingAsDelegate = (0, useOnyx_1.default)(ONYXKEYS_1.default.ACCOUNT, {
        selector: function (account) { var _a; return !!((_a = account === null || account === void 0 ? void 0 : account.delegatedAccess) === null || _a === void 0 ? void 0 : _a.delegate); },
        canBeMissing: true,
    })[0];
    var currentUserAccountID = (0, useOnyx_1.default)(ONYXKEYS_1.default.SESSION, {
        selector: function (session) { return session === null || session === void 0 ? void 0 : session.accountID; },
        canBeMissing: true,
    })[0];
    var isActingAsDelegateRef = (0, react_1.useRef)(isActingAsDelegate);
    var delegatorEmailRef = (0, react_1.useRef)((0, Url_1.getSearchParamFromUrl)((0, currentUrl_1.default)(), 'delegatorEmail'));
    (0, react_1.useEffect)(function () {
        // If we've shown the prompt and still have a listener registered,
        // remove the listener and reset its ref to undefined
        if (hasShownPrompt && removeListener.current !== undefined) {
            removeListener.current();
            removeListener.current = undefined;
        }
        if (isAuthenticated === false) {
            setHasShownPrompt(false);
            Navigation_1.default.isNavigationReady().then(function () {
                var _a, _b;
                // Get initial route
                var initialRoute = (_a = navigationRef_1.default.current) === null || _a === void 0 ? void 0 : _a.getCurrentRoute();
                setCurrentScreen(initialRoute === null || initialRoute === void 0 ? void 0 : initialRoute.name);
                removeListener.current = (_b = navigationRef_1.default.current) === null || _b === void 0 ? void 0 : _b.addListener('state', function (event) {
                    setCurrentScreen(Navigation_1.default.getRouteNameFromStateEvent(event));
                });
            });
        }
    }, [hasShownPrompt, isAuthenticated]);
    (0, react_1.useEffect)(function () {
        // According to the design, we don't support unlink in Desktop app https://github.com/Expensify/App/issues/19681#issuecomment-1610353099
        var routeRegex = new RegExp(CONST_1.default.REGEX.ROUTES.UNLINK_LOGIN);
        var isUnsupportedDeeplinkRoute = routeRegex.test(window.location.pathname);
        var route = window.location.pathname.replace('/', '');
        var isConnectionCompleteRoute = route === ROUTES_1.default.CONNECTION_COMPLETE || route === ROUTES_1.default.BANK_CONNECTION_COMPLETE;
        // Making a few checks to exit early before checking authentication status
        if (!isMacOSWeb() ||
            isUnsupportedDeeplinkRoute ||
            hasShownPrompt ||
            isConnectionCompleteRoute ||
            CONFIG_1.default.ENVIRONMENT === CONST_1.default.ENVIRONMENT.DEV ||
            autoAuthState === CONST_1.default.AUTO_AUTH_STATE.NOT_STARTED ||
            (0, Session_1.isAnonymousUser)() ||
            !!delegatorEmailRef.current ||
            isActingAsDelegateRef.current) {
            return;
        }
        // We want to show the prompt immediately if the user is already authenticated.
        // Otherwise, we want to wait until the navigation state is set up
        // and we know the user is on a screen that supports deeplinks.
        if (isAuthenticated) {
            promptToOpenInDesktopApp(currentUserAccountID, initialUrl);
            setHasShownPrompt(true);
        }
        else {
            // Navigation state is not set up yet, we're unsure if we should show the deep link prompt or not
            if (currentScreen === undefined || isAuthenticated === false) {
                return;
            }
            var preventPrompt = (0, shouldPreventDeeplinkPrompt_1.default)(currentScreen);
            if (preventPrompt === true) {
                return;
            }
            promptToOpenInDesktopApp();
            setHasShownPrompt(true);
        }
    }, [currentScreen, hasShownPrompt, isAuthenticated, autoAuthState, initialUrl, currentUserAccountID]);
    return children;
}
DeeplinkWrapper.displayName = 'DeeplinkWrapper';
exports.default = DeeplinkWrapper;
