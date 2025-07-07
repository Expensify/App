"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_webview_1 = require("react-native-webview");
var FullPageOfflineBlockingView_1 = require("@components/BlockingViews/FullPageOfflineBlockingView");
var FullscreenLoadingIndicator_1 = require("@components/FullscreenLoadingIndicator");
var HeaderWithBackButton_1 = require("@components/HeaderWithBackButton");
var Modal_1 = require("@components/Modal");
var RequireTwoFactorAuthenticationModal_1 = require("@components/RequireTwoFactorAuthenticationModal");
var useLocalize_1 = require("@hooks/useLocalize");
var useOnyx_1 = require("@hooks/useOnyx");
var Xero_1 = require("@libs/actions/connections/Xero");
var Modal_2 = require("@libs/actions/Modal");
var getUAForWebView_1 = require("@libs/getUAForWebView");
var Navigation_1 = require("@libs/Navigation/Navigation");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var ROUTES_1 = require("@src/ROUTES");
function ConnectToXeroFlow(_a) {
    var _b, _c;
    var policyID = _a.policyID;
    var translate = (0, useLocalize_1.default)().translate;
    var webViewRef = (0, react_1.useRef)(null);
    var _d = (0, react_1.useState)(false), isWebViewOpen = _d[0], setIsWebViewOpen = _d[1];
    var session = (0, useOnyx_1.default)(ONYXKEYS_1.default.SESSION, { canBeMissing: false })[0];
    var authToken = (_b = session === null || session === void 0 ? void 0 : session.authToken) !== null && _b !== void 0 ? _b : null;
    var account = (0, useOnyx_1.default)(ONYXKEYS_1.default.ACCOUNT, { canBeMissing: false })[0];
    var is2FAEnabled = (_c = account === null || account === void 0 ? void 0 : account.requiresTwoFactorAuth) !== null && _c !== void 0 ? _c : false;
    var renderLoading = function () { return <FullscreenLoadingIndicator_1.default />; };
    var _e = (0, react_1.useState)(false), isRequire2FAModalOpen = _e[0], setIsRequire2FAModalOpen = _e[1];
    (0, react_1.useEffect)(function () {
        if (!is2FAEnabled) {
            setIsRequire2FAModalOpen(true);
            return;
        }
        setIsWebViewOpen(true);
        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
    }, []);
    return (<>
            {!is2FAEnabled && (<RequireTwoFactorAuthenticationModal_1.default onSubmit={function () {
                setIsRequire2FAModalOpen(false);
                (0, Modal_2.close)(function () { return Navigation_1.default.navigate(ROUTES_1.default.SETTINGS_2FA_ROOT.getRoute(ROUTES_1.default.POLICY_ACCOUNTING.getRoute(policyID), (0, Xero_1.getXeroSetupLink)(policyID))); });
            }} onCancel={function () { return setIsRequire2FAModalOpen(false); }} isVisible={isRequire2FAModalOpen} description={translate('twoFactorAuth.twoFactorAuthIsRequiredDescription')}/>)}
            <Modal_1.default onClose={function () { return setIsWebViewOpen(false); }} fullscreen isVisible={isWebViewOpen} type={CONST_1.default.MODAL.MODAL_TYPE.CENTERED_UNSWIPEABLE} shouldUseReanimatedModal>
                <HeaderWithBackButton_1.default title={translate('workspace.accounting.title')} onBackButtonPress={function () { return setIsWebViewOpen(false); }} shouldDisplayHelpButton={false}/>
                <FullPageOfflineBlockingView_1.default>
                    <react_native_webview_1.WebView ref={webViewRef} source={{
            uri: (0, Xero_1.getXeroSetupLink)(policyID),
            headers: {
                Cookie: "authToken=".concat(authToken),
            },
        }} userAgent={(0, getUAForWebView_1.default)()} incognito startInLoadingState renderLoading={renderLoading}/>
                </FullPageOfflineBlockingView_1.default>
            </Modal_1.default>
        </>);
}
ConnectToXeroFlow.displayName = 'ConnectToXeroFlow';
exports.default = ConnectToXeroFlow;
