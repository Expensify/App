"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var ConfirmModal_1 = require("@components/ConfirmModal");
var Expensicons = require("@components/Icon/Expensicons");
var Illustrations = require("@components/Icon/Illustrations");
var MenuItem_1 = require("@components/MenuItem");
var ScrollView_1 = require("@components/ScrollView");
var Section_1 = require("@components/Section");
var Text_1 = require("@components/Text");
var useLocalize_1 = require("@hooks/useLocalize");
var useOnyx_1 = require("@hooks/useOnyx");
var useTheme_1 = require("@hooks/useTheme");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var Navigation_1 = require("@libs/Navigation/Navigation");
var PolicyUtils_1 = require("@libs/PolicyUtils");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var ROUTES_1 = require("@src/ROUTES");
var TwoFactorAuthWrapper_1 = require("./TwoFactorAuthWrapper");
function EnabledPage() {
    var theme = (0, useTheme_1.default)();
    var styles = (0, useThemeStyles_1.default)();
    var _a = (0, react_1.useState)(false), isVisible = _a[0], setIsVisible = _a[1];
    var currentUserLogin = (0, useOnyx_1.default)(ONYXKEYS_1.default.SESSION, { selector: function (session) { return session === null || session === void 0 ? void 0 : session.email; } })[0];
    var translate = (0, useLocalize_1.default)().translate;
    var closeModal = (0, react_1.useCallback)(function () {
        setIsVisible(false);
    }, []);
    return (<TwoFactorAuthWrapper_1.default stepName={CONST_1.default.TWO_FACTOR_AUTH_STEPS.ENABLED} title={translate('twoFactorAuth.headerTitle')} shouldEnableKeyboardAvoidingView={false}>
            <ScrollView_1.default>
                <Section_1.default title={translate('twoFactorAuth.twoFactorAuthEnabled')} icon={Illustrations.ShieldYellow} containerStyles={[styles.twoFactorAuthSection, styles.mb0]}>
                    <react_native_1.View style={styles.mv3}>
                        <Text_1.default style={styles.textLabel}>{translate('twoFactorAuth.whatIsTwoFactorAuth')}</Text_1.default>
                    </react_native_1.View>
                </Section_1.default>
                <MenuItem_1.default title={translate('twoFactorAuth.disableTwoFactorAuth')} onPress={function () {
            if ((0, PolicyUtils_1.hasPolicyWithXeroConnection)(currentUserLogin)) {
                setIsVisible(true);
                return;
            }
            Navigation_1.default.navigate(ROUTES_1.default.SETTINGS_2FA_DISABLE);
        }} icon={Expensicons.Close} iconFill={theme.danger}/>
                <ConfirmModal_1.default title={translate('twoFactorAuth.twoFactorAuthCannotDisable')} prompt={translate('twoFactorAuth.twoFactorAuthRequired')} confirmText={translate('common.buttonConfirm')} onConfirm={closeModal} shouldShowCancelButton={false} onBackdropPress={closeModal} onCancel={closeModal} isVisible={isVisible}/>
            </ScrollView_1.default>
        </TwoFactorAuthWrapper_1.default>);
}
EnabledPage.displayName = 'EnabledPage';
exports.default = EnabledPage;
