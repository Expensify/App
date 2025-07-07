"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_webview_1 = require("react-native-webview");
var FullPageOfflineBlockingView_1 = require("@components/BlockingViews/FullPageOfflineBlockingView");
var HeaderWithBackButton_1 = require("@components/HeaderWithBackButton");
var SAMLLoadingIndicator_1 = require("@components/SAMLLoadingIndicator");
var ScreenWrapper_1 = require("@components/ScreenWrapper");
var useLocalize_1 = require("@hooks/useLocalize");
var useOnyx_1 = require("@hooks/useOnyx");
var getPlatform_1 = require("@libs/getPlatform");
var getUAForWebView_1 = require("@libs/getUAForWebView");
var Log_1 = require("@libs/Log");
var LoginUtils_1 = require("@libs/LoginUtils");
var Navigation_1 = require("@libs/Navigation/Navigation");
var Session_1 = require("@userActions/Session");
var CONFIG_1 = require("@src/CONFIG");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var ROUTES_1 = require("@src/ROUTES");
function SAMLSignInPage() {
    var account = (0, useOnyx_1.default)(ONYXKEYS_1.default.ACCOUNT)[0];
    var credentials = (0, useOnyx_1.default)(ONYXKEYS_1.default.CREDENTIALS)[0];
    var _a = (0, react_1.useState)(true), showNavigation = _a[0], shouldShowNavigation = _a[1];
    var _b = (0, react_1.useState)(''), SAMLUrl = _b[0], setSAMLUrl = _b[1];
    var webViewRef = (0, react_1.useRef)(null);
    var translate = (0, useLocalize_1.default)().translate;
    (0, react_1.useEffect)(function () {
        // If we don't have a valid login to pass here, direct the user back to a clean sign in state to try again
        if (!(credentials === null || credentials === void 0 ? void 0 : credentials.login)) {
            (0, LoginUtils_1.handleSAMLLoginError)(translate('common.error.email'), true);
            return;
        }
        // If we've already gotten a url back to log into the user's Identity Provider (IdP), then don't re-fetch it
        if (SAMLUrl) {
            return;
        }
        var body = new FormData();
        body.append('email', credentials.login);
        body.append('referer', CONFIG_1.default.EXPENSIFY.EXPENSIFY_CASH_REFERER);
        body.append('platform', (0, getPlatform_1.default)());
        (0, LoginUtils_1.postSAMLLogin)(body)
            .then(function (response) {
            if (!response || !response.url) {
                (0, LoginUtils_1.handleSAMLLoginError)(translate('common.error.login'), false);
                return;
            }
            setSAMLUrl(response.url);
        })
            .catch(function (error) {
            var _a;
            (0, LoginUtils_1.handleSAMLLoginError)((_a = error.message) !== null && _a !== void 0 ? _a : translate('common.error.login'), false);
        });
    }, [credentials === null || credentials === void 0 ? void 0 : credentials.login, SAMLUrl, translate]);
    /**
     * Handles in-app navigation once we get a response back from Expensify
     */
    var handleNavigationStateChange = (0, react_1.useCallback)(function (_a) {
        var _b;
        var url = _a.url;
        // If we've gotten a callback then remove the option to navigate back to the sign-in page
        if (url.includes('loginCallback')) {
            shouldShowNavigation(false);
        }
        var searchParams = new URLSearchParams(new URL(url).search);
        var shortLivedAuthToken = searchParams.get('shortLivedAuthToken');
        if (!(account === null || account === void 0 ? void 0 : account.isLoading) && (credentials === null || credentials === void 0 ? void 0 : credentials.login) && !!shortLivedAuthToken) {
            Log_1.default.info('SAMLSignInPage - Successfully received shortLivedAuthToken. Signing in...');
            (0, Session_1.signInWithShortLivedAuthToken)(shortLivedAuthToken);
        }
        // If the login attempt is unsuccessful, set the error message for the account and redirect to sign in page
        if (searchParams.has('error')) {
            (0, Session_1.clearSignInData)();
            (0, Session_1.setAccountError)((_b = searchParams.get('error')) !== null && _b !== void 0 ? _b : '');
            Navigation_1.default.isNavigationReady().then(function () {
                // We must call goBack() to remove the /transition route from history
                Navigation_1.default.goBack();
                Navigation_1.default.navigate(ROUTES_1.default.HOME);
            });
        }
    }, [credentials === null || credentials === void 0 ? void 0 : credentials.login, shouldShowNavigation, account === null || account === void 0 ? void 0 : account.isLoading]);
    return (<ScreenWrapper_1.default shouldShowOfflineIndicator={false} includeSafeAreaPaddingBottom={false} testID={SAMLSignInPage.displayName}>
            {showNavigation && (<HeaderWithBackButton_1.default title="" onBackButtonPress={function () {
                (0, Session_1.clearSignInData)();
                Navigation_1.default.isNavigationReady().then(function () {
                    Navigation_1.default.goBack();
                });
            }}/>)}
            <FullPageOfflineBlockingView_1.default>
                {!SAMLUrl ? (<SAMLLoadingIndicator_1.default />) : (<react_native_webview_1.default ref={webViewRef} originWhitelist={['https://*']} source={{ uri: SAMLUrl }} userAgent={(0, getUAForWebView_1.default)()} incognito // 'incognito' prop required for Android, issue here https://github.com/react-native-webview/react-native-webview/issues/1352
         startInLoadingState renderLoading={function () { return <SAMLLoadingIndicator_1.default />; }} onNavigationStateChange={handleNavigationStateChange}/>)}
            </FullPageOfflineBlockingView_1.default>
        </ScreenWrapper_1.default>);
}
SAMLSignInPage.displayName = 'SAMLSignInPage';
exports.default = SAMLSignInPage;
