"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var isEmpty_1 = require("lodash/isEmpty");
var react_1 = require("react");
var react_native_1 = require("react-native");
var Button_1 = require("@components/Button");
var ConfirmModal_1 = require("@components/ConfirmModal");
var FixedFooter_1 = require("@components/FixedFooter");
var ScrollView_1 = require("@components/ScrollView");
var Text_1 = require("@components/Text");
var useLocalize_1 = require("@hooks/useLocalize");
var useOnyx_1 = require("@hooks/useOnyx");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var Session_1 = require("@libs/actions/Session");
var Navigation_1 = require("@libs/Navigation/Navigation");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var ROUTES_1 = require("@src/ROUTES");
var TwoFactorAuthForm_1 = require("./TwoFactorAuthForm");
var TwoFactorAuthWrapper_1 = require("./TwoFactorAuthWrapper");
function DisablePage() {
    var _a, _b;
    var styles = (0, useThemeStyles_1.default)();
    var translate = (0, useLocalize_1.default)().translate;
    var account = (0, useOnyx_1.default)(ONYXKEYS_1.default.ACCOUNT)[0];
    var formRef = (0, react_1.useRef)(null);
    (0, react_1.useEffect)(function () {
        if (account === null || account === void 0 ? void 0 : account.requiresTwoFactorAuth) {
            return;
        }
        Navigation_1.default.navigate(ROUTES_1.default.SETTINGS_2FA_DISABLED, { forceReplace: true });
    }, [account === null || account === void 0 ? void 0 : account.requiresTwoFactorAuth]);
    var closeModal = (0, react_1.useCallback)(function () {
        (0, Session_1.clearDisableTwoFactorAuthErrors)();
        // Go back to the previous page because the user can't disable 2FA and this page is no longer relevant
        Navigation_1.default.goBack();
    }, []);
    return (<TwoFactorAuthWrapper_1.default stepName={CONST_1.default.TWO_FACTOR_AUTH_STEPS.DISABLE} title={translate('twoFactorAuth.disableTwoFactorAuth')}>
            <ScrollView_1.default contentContainerStyle={styles.flexGrow1}>
                <react_native_1.View style={[styles.ph5, styles.mt3]}>
                    <Text_1.default>{translate('twoFactorAuth.explainProcessToRemove')}</Text_1.default>
                </react_native_1.View>
                <react_native_1.View style={[styles.mh5, styles.mb4, styles.mt3]}>
                    <TwoFactorAuthForm_1.default innerRef={formRef} validateInsteadOfDisable={false}/>
                </react_native_1.View>
            </ScrollView_1.default>
            <FixedFooter_1.default style={[styles.mt2, styles.pt2]}>
                <Button_1.default success large text={translate('twoFactorAuth.disable')} isLoading={account === null || account === void 0 ? void 0 : account.isLoading} onPress={function () {
            if (!formRef.current) {
                return;
            }
            formRef.current.validateAndSubmitForm();
        }}/>
            </FixedFooter_1.default>
            <ConfirmModal_1.default title={translate('twoFactorAuth.twoFactorAuthCannotDisable')} prompt={translate('twoFactorAuth.twoFactorAuthRequired')} confirmText={translate('common.buttonConfirm')} onConfirm={closeModal} shouldShowCancelButton={false} onBackdropPress={closeModal} onCancel={closeModal} isVisible={!(0, isEmpty_1.default)((_b = (_a = account === null || account === void 0 ? void 0 : account.errorFields) === null || _a === void 0 ? void 0 : _a.requiresTwoFactorAuth) !== null && _b !== void 0 ? _b : {})}/>
        </TwoFactorAuthWrapper_1.default>);
}
DisablePage.displayName = 'DisablePage';
exports.default = DisablePage;
