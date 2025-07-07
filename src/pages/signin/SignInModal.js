"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var HeaderWithBackButton_1 = require("@components/HeaderWithBackButton");
var OnyxProvider_1 = require("@components/OnyxProvider");
var ScreenWrapper_1 = require("@components/ScreenWrapper");
var useStyleUtils_1 = require("@hooks/useStyleUtils");
var useTheme_1 = require("@hooks/useTheme");
var App_1 = require("@libs/actions/App");
var Navigation_1 = require("@libs/Navigation/Navigation");
var SequentialQueue_1 = require("@libs/Network/SequentialQueue");
var CONST_1 = require("@src/CONST");
var SCREENS_1 = require("@src/SCREENS");
var SignInPage_1 = require("./SignInPage");
function SignInModal() {
    var theme = (0, useTheme_1.default)();
    var StyleUtils = (0, useStyleUtils_1.default)();
    var signinPageRef = (0, react_1.useRef)(null);
    var session = (0, OnyxProvider_1.useSession)();
    (0, react_1.useEffect)(function () {
        var isAnonymousUser = (session === null || session === void 0 ? void 0 : session.authTokenType) === CONST_1.default.AUTH_TOKEN_TYPES.ANONYMOUS;
        if (!isAnonymousUser) {
            // Signing in RHP is only for anonymous users
            Navigation_1.default.isNavigationReady().then(function () {
                Navigation_1.default.dismissModal();
            });
            // To prevent deadlock when OpenReport and OpenApp overlap, wait for the queue to be idle before calling openApp.
            // This ensures that any communication gaps between the client and server during OpenReport processing do not cause the queue to pause,
            // which would prevent us from processing or clearing the queue.
            (0, SequentialQueue_1.waitForIdle)().then(function () {
                (0, App_1.openApp)(true);
            });
        }
    }, [session === null || session === void 0 ? void 0 : session.authTokenType]);
    return (<ScreenWrapper_1.default style={[StyleUtils.getBackgroundColorStyle(theme.PAGE_THEMES[SCREENS_1.default.RIGHT_MODAL.SIGN_IN].backgroundColor)]} includeSafeAreaPaddingBottom={false} shouldEnableMaxHeight shouldShowOfflineIndicator={false} testID={SignInModal.displayName}>
            <HeaderWithBackButton_1.default onBackButtonPress={function () {
            var _a;
            if (!signinPageRef.current) {
                Navigation_1.default.goBack();
                return;
            }
            (_a = signinPageRef.current) === null || _a === void 0 ? void 0 : _a.navigateBack();
        }}/>
            <SignInPage_1.default shouldEnableMaxHeight={false} ref={signinPageRef}/>
        </ScreenWrapper_1.default>);
}
SignInModal.displayName = 'SignInModal';
exports.default = SignInModal;
