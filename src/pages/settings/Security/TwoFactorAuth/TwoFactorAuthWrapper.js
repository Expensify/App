"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var FullPageNotFoundView_1 = require("@components/BlockingViews/FullPageNotFoundView");
var FullPageOfflineBlockingView_1 = require("@components/BlockingViews/FullPageOfflineBlockingView");
var DelegateNoAccessWrapper_1 = require("@components/DelegateNoAccessWrapper");
var HeaderWithBackButton_1 = require("@components/HeaderWithBackButton");
var ScreenWrapper_1 = require("@components/ScreenWrapper");
var useOnyx_1 = require("@hooks/useOnyx");
var TwoFactorAuthActions_1 = require("@libs/actions/TwoFactorAuthActions");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var ROUTES_1 = require("@src/ROUTES");
function TwoFactorAuthWrapper(_a) {
    var _b;
    var stepName = _a.stepName, title = _a.title, stepCounter = _a.stepCounter, onBackButtonPress = _a.onBackButtonPress, _c = _a.shouldEnableKeyboardAvoidingView, shouldEnableKeyboardAvoidingView = _c === void 0 ? true : _c, children = _a.children;
    var account = (0, useOnyx_1.default)(ONYXKEYS_1.default.ACCOUNT)[0];
    var isActingAsDelegate = !!((_b = account === null || account === void 0 ? void 0 : account.delegatedAccess) === null || _b === void 0 ? void 0 : _b.delegate);
    // eslint-disable-next-line rulesdir/no-negated-variables
    var shouldShowNotFound = (0, react_1.useMemo)(function () {
        if (!account) {
            return true;
        }
        var is2FAEnabled = !!account.requiresTwoFactorAuth;
        switch (stepName) {
            case CONST_1.default.TWO_FACTOR_AUTH_STEPS.COPY_CODES:
            case CONST_1.default.TWO_FACTOR_AUTH_STEPS.ENABLED:
            case CONST_1.default.TWO_FACTOR_AUTH_STEPS.DISABLE:
                return false;
            case CONST_1.default.TWO_FACTOR_AUTH_STEPS.VERIFY:
                return !account.codesAreCopied;
            case CONST_1.default.TWO_FACTOR_AUTH_STEPS.SUCCESS:
                return !is2FAEnabled;
            case CONST_1.default.TWO_FACTOR_AUTH_STEPS.DISABLED:
                return is2FAEnabled;
            default:
                return false;
        }
    }, [account, stepName]);
    if (isActingAsDelegate) {
        return (<ScreenWrapper_1.default testID={TwoFactorAuthWrapper.displayName} includeSafeAreaPaddingBottom={false} shouldEnablePickerAvoiding={false}>
                <DelegateNoAccessWrapper_1.default accessDeniedVariants={[CONST_1.default.DELEGATE.DENIED_ACCESS_VARIANTS.DELEGATE]}/>
            </ScreenWrapper_1.default>);
    }
    var defaultGoBack = function () { return (0, TwoFactorAuthActions_1.quitAndNavigateBack)(ROUTES_1.default.SETTINGS_SECURITY); };
    return (<ScreenWrapper_1.default shouldShowOfflineIndicator={false} shouldEnableKeyboardAvoidingView={shouldEnableKeyboardAvoidingView} shouldEnableMaxHeight testID={stepName}>
            <FullPageNotFoundView_1.default shouldShow={shouldShowNotFound} linkKey="securityPage.goToSecurity" onLinkPress={defaultGoBack}>
                <HeaderWithBackButton_1.default title={title} stepCounter={stepCounter} onBackButtonPress={onBackButtonPress !== null && onBackButtonPress !== void 0 ? onBackButtonPress : defaultGoBack}/>
                <FullPageOfflineBlockingView_1.default>{children}</FullPageOfflineBlockingView_1.default>
            </FullPageNotFoundView_1.default>
        </ScreenWrapper_1.default>);
}
TwoFactorAuthWrapper.displayName = 'TwoFactorAuthWrapper';
exports.default = TwoFactorAuthWrapper;
