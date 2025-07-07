"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var Button_1 = require("@components/Button");
var Icon_1 = require("@components/Icon");
var Illustrations_1 = require("@components/Icon/Illustrations");
var ScreenWrapper_1 = require("@components/ScreenWrapper");
var Text_1 = require("@components/Text");
var useLocalize_1 = require("@hooks/useLocalize");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var Navigation_1 = require("@libs/Navigation/Navigation");
var variables_1 = require("@styles/variables");
var ROUTES_1 = require("@src/ROUTES");
function RequireTwoFactorAuthenticationPage() {
    var styles = (0, useThemeStyles_1.default)();
    var translate = (0, useLocalize_1.default)().translate;
    return (<ScreenWrapper_1.default testID={RequireTwoFactorAuthenticationPage.displayName}>
            <react_native_1.View style={[styles.twoFARequiredContainer]}>
                <react_native_1.View style={[styles.twoFAIllustration, styles.alignItemsCenter]}>
                    <Icon_1.default src={Illustrations_1.Encryption} width={variables_1.default.twoFAIconHeight} height={variables_1.default.twoFAIconHeight}/>
                </react_native_1.View>
                <react_native_1.View style={[styles.mt2, styles.mh5, styles.dFlex, styles.alignItemsCenter]}>
                    <react_native_1.View style={[styles.mb5]}>
                        <Text_1.default style={[styles.textHeadlineH1, styles.textAlignCenter, styles.mv2]}>{translate('twoFactorAuth.twoFactorAuthIsRequiredForAdminsHeader')}</Text_1.default>
                        <Text_1.default style={[styles.textSupporting, styles.textAlignCenter]}>{translate('twoFactorAuth.twoFactorAuthIsRequiredForAdminsDescription')}</Text_1.default>
                    </react_native_1.View>
                    <Button_1.default large success pressOnEnter onPress={function () { return Navigation_1.default.navigate(ROUTES_1.default.SETTINGS_2FA_ROOT.getRoute(ROUTES_1.default.REQUIRE_TWO_FACTOR_AUTH)); }} text={translate('twoFactorAuth.enableTwoFactorAuth')}/>
                </react_native_1.View>
            </react_native_1.View>
        </ScreenWrapper_1.default>);
}
RequireTwoFactorAuthenticationPage.displayName = 'RequireTwoFactorAuthenticationPage';
exports.default = RequireTwoFactorAuthenticationPage;
