"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var Button_1 = require("@components/Button");
var Expensicons = require("@components/Icon/Expensicons");
var Illustrations = require("@components/Icon/Illustrations");
var Section_1 = require("@components/Section");
var Text_1 = require("@components/Text");
var TextLink_1 = require("@components/TextLink");
var useLocalize_1 = require("@hooks/useLocalize");
var useOnyx_1 = require("@hooks/useOnyx");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var getPlaidDesktopMessage_1 = require("@libs/getPlaidDesktopMessage");
var BankAccounts = require("@userActions/BankAccounts");
var Link = require("@userActions/Link");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var ROUTES_1 = require("@src/ROUTES");
var plaidDesktopMessage = (0, getPlaidDesktopMessage_1.default)();
function SetupMethod() {
    var styles = (0, useThemeStyles_1.default)();
    var translate = (0, useLocalize_1.default)().translate;
    var isPlaidDisabled = (0, useOnyx_1.default)(ONYXKEYS_1.default.IS_PLAID_DISABLED)[0];
    return (<react_native_1.View>
            <Section_1.default icon={Illustrations.MoneyWings} title={translate('walletPage.addYourBankAccount')} titleStyles={[styles.textHeadlineLineHeightXXL]}>
                <react_native_1.View style={[styles.mv3]}>
                    <Text_1.default>{translate('walletPage.addBankAccountBody')}</Text_1.default>
                </react_native_1.View>
                {!!plaidDesktopMessage && (<react_native_1.View style={[styles.mv3, styles.flexRow, styles.justifyContentBetween]}>
                        <TextLink_1.default onPress={function () { return Link.openExternalLinkWithToken(ROUTES_1.default.SETTINGS_ENABLE_PAYMENTS); }}>{translate(plaidDesktopMessage)}</TextLink_1.default>
                    </react_native_1.View>)}
                <Button_1.default icon={Expensicons.Bank} text={translate('bankAccount.addBankAccount')} onPress={function () {
            BankAccounts.openPersonalBankAccountSetupWithPlaid();
        }} isDisabled={!!isPlaidDisabled} style={[styles.mt4, styles.mb2]} iconStyles={styles.buttonCTAIcon} shouldShowRightIcon success large/>
            </Section_1.default>
        </react_native_1.View>);
}
SetupMethod.displayName = 'SetupMethod';
exports.default = SetupMethod;
