"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var ConfirmationPage_1 = require("@components/ConfirmationPage");
var LottieAnimations_1 = require("@components/LottieAnimations");
var useEnvironment_1 = require("@hooks/useEnvironment");
var useLocalize_1 = require("@hooks/useLocalize");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var Navigation_1 = require("@libs/Navigation/Navigation");
var Link_1 = require("@userActions/Link");
var TwoFactorAuthActions_1 = require("@userActions/TwoFactorAuthActions");
var CONST_1 = require("@src/CONST");
var ROUTES_1 = require("@src/ROUTES");
var TwoFactorAuthWrapper_1 = require("./TwoFactorAuthWrapper");
function SuccessPage(_a) {
    var _b;
    var route = _a.route;
    var translate = (0, useLocalize_1.default)().translate;
    var environmentURL = (0, useEnvironment_1.default)().environmentURL;
    var styles = (0, useThemeStyles_1.default)();
    var goBack = (0, react_1.useCallback)(function () {
        var _a, _b, _c;
        if (((_a = route.params) === null || _a === void 0 ? void 0 : _a.backTo) === ROUTES_1.default.REQUIRE_TWO_FACTOR_AUTH) {
            Navigation_1.default.dismissModal();
            return;
        }
        (0, TwoFactorAuthActions_1.quitAndNavigateBack)((_c = (_b = route.params) === null || _b === void 0 ? void 0 : _b.backTo) !== null && _c !== void 0 ? _c : ROUTES_1.default.SETTINGS_2FA_ROOT.getRoute());
    }, [(_b = route.params) === null || _b === void 0 ? void 0 : _b.backTo]);
    (0, react_1.useEffect)(function () {
        return function () {
            var _a;
            // When the 2FA RHP is closed, we want to remove the 2FA required page from the navigation stack too.
            if (((_a = route.params) === null || _a === void 0 ? void 0 : _a.backTo) !== ROUTES_1.default.REQUIRE_TWO_FACTOR_AUTH) {
                return;
            }
            Navigation_1.default.popRootToTop();
        };
        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
    }, []);
    return (<TwoFactorAuthWrapper_1.default stepName={CONST_1.default.TWO_FACTOR_AUTH_STEPS.SUCCESS} title={translate('twoFactorAuth.headerTitle')} stepCounter={{
            step: 3,
            text: translate('twoFactorAuth.stepSuccess'),
        }} onBackButtonPress={goBack}>
            <ConfirmationPage_1.default illustration={LottieAnimations_1.default.Fireworks} heading={translate('twoFactorAuth.enabled')} description={translate('twoFactorAuth.congrats')} shouldShowButton buttonText={translate('common.buttonConfirm')} onButtonPress={function () {
            var _a;
            goBack();
            if ((_a = route.params) === null || _a === void 0 ? void 0 : _a.forwardTo) {
                (0, Link_1.openLink)(route.params.forwardTo, environmentURL);
            }
        }} containerStyle={styles.flex1}/>
        </TwoFactorAuthWrapper_1.default>);
}
SuccessPage.displayName = 'SuccessPage';
exports.default = SuccessPage;
