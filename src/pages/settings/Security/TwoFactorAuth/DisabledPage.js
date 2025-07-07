"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var BlockingView_1 = require("@components/BlockingViews/BlockingView");
var Button_1 = require("@components/Button");
var FixedFooter_1 = require("@components/FixedFooter");
var Illustrations = require("@components/Icon/Illustrations");
var useLocalize_1 = require("@hooks/useLocalize");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var variables_1 = require("@styles/variables");
var TwoFactorAuthActions_1 = require("@userActions/TwoFactorAuthActions");
var CONST_1 = require("@src/CONST");
var ROUTES_1 = require("@src/ROUTES");
var TwoFactorAuthWrapper_1 = require("./TwoFactorAuthWrapper");
function DisabledPage() {
    var styles = (0, useThemeStyles_1.default)();
    var translate = (0, useLocalize_1.default)().translate;
    return (<TwoFactorAuthWrapper_1.default stepName={CONST_1.default.TWO_FACTOR_AUTH_STEPS.DISABLED} title={translate('twoFactorAuth.disableTwoFactorAuth')}>
            <BlockingView_1.default icon={Illustrations.LockOpen} iconWidth={variables_1.default.modalTopIconWidth} iconHeight={variables_1.default.modalTopIconHeight} title={translate('twoFactorAuth.disabled')} subtitle={translate('twoFactorAuth.noAuthenticatorApp')}/>
            <FixedFooter_1.default style={[styles.flexGrow0]}>
                <Button_1.default success large text={translate('common.buttonConfirm')} onPress={function () { return (0, TwoFactorAuthActions_1.quitAndNavigateBack)(ROUTES_1.default.SETTINGS_SECURITY); }}/>
            </FixedFooter_1.default>
        </TwoFactorAuthWrapper_1.default>);
}
DisabledPage.displayName = 'DisabledPage';
exports.default = DisabledPage;
