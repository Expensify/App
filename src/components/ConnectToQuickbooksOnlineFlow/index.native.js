"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_webview_1 = require("react-native-webview");
var FullPageOfflineBlockingView_1 = require("@components/BlockingViews/FullPageOfflineBlockingView");
var FullscreenLoadingIndicator_1 = require("@components/FullscreenLoadingIndicator");
var HeaderWithBackButton_1 = require("@components/HeaderWithBackButton");
var Modal_1 = require("@components/Modal");
var useLocalize_1 = require("@hooks/useLocalize");
var useOnyx_1 = require("@hooks/useOnyx");
var QuickbooksOnline_1 = require("@libs/actions/connections/QuickbooksOnline");
var Policy_1 = require("@userActions/Policy/Policy");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var renderLoading = function () { return <FullscreenLoadingIndicator_1.default />; };
function ConnectToQuickbooksOnlineFlow(_a) {
    var _b;
    var policyID = _a.policyID;
    var translate = (0, useLocalize_1.default)().translate;
    var webViewRef = (0, react_1.useRef)(null);
    var _c = (0, react_1.useState)(false), isWebViewOpen = _c[0], setIsWebViewOpen = _c[1];
    var session = (0, useOnyx_1.default)(ONYXKEYS_1.default.SESSION, { canBeMissing: false })[0];
    var authToken = (_b = session === null || session === void 0 ? void 0 : session.authToken) !== null && _b !== void 0 ? _b : null;
    (0, react_1.useEffect)(function () {
        // Since QBO doesn't support Taxes, we should disable them from the LHN when connecting to QBO
        (0, Policy_1.enablePolicyTaxes)(policyID, false);
        setIsWebViewOpen(true);
        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
    }, []);
    return (<Modal_1.default onClose={function () { return setIsWebViewOpen(false); }} fullscreen isVisible={isWebViewOpen} type={CONST_1.default.MODAL.MODAL_TYPE.CENTERED_UNSWIPEABLE} shouldUseReanimatedModal>
            <HeaderWithBackButton_1.default title={translate('workspace.accounting.title')} onBackButtonPress={function () { return setIsWebViewOpen(false); }} shouldDisplayHelpButton={false}/>
            <FullPageOfflineBlockingView_1.default>
                <react_native_webview_1.WebView ref={webViewRef} source={{
            uri: (0, QuickbooksOnline_1.getQuickbooksOnlineSetupLink)(policyID),
            headers: {
                Cookie: "authToken=".concat(authToken),
            },
        }} incognito // 'incognito' prop required for Android, issue here https://github.com/react-native-webview/react-native-webview/issues/1352
     startInLoadingState renderLoading={renderLoading}/>
            </FullPageOfflineBlockingView_1.default>
        </Modal_1.default>);
}
ConnectToQuickbooksOnlineFlow.displayName = 'ConnectToQuickbooksOnlineFlow';
exports.default = ConnectToQuickbooksOnlineFlow;
