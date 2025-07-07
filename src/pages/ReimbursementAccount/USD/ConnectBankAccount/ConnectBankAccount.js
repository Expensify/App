"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var HeaderWithBackButton_1 = require("@components/HeaderWithBackButton");
var ScreenWrapper_1 = require("@components/ScreenWrapper");
var Text_1 = require("@components/Text");
var TextLink_1 = require("@components/TextLink");
var useLocalize_1 = require("@hooks/useLocalize");
var useOnyx_1 = require("@hooks/useOnyx");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var BankAccount_1 = require("@libs/models/BankAccount");
var ConnectedVerifiedBankAccount_1 = require("@pages/ReimbursementAccount/ConnectedVerifiedBankAccount");
var Report_1 = require("@userActions/Report");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var BankAccountValidationForm_1 = require("./components/BankAccountValidationForm");
var FinishChatCard_1 = require("./components/FinishChatCard");
function ConnectBankAccount(_a) {
    var _b, _c, _d, _e, _f;
    var onBackButtonPress = _a.onBackButtonPress, setShouldShowConnectedVerifiedBankAccount = _a.setShouldShowConnectedVerifiedBankAccount, setUSDBankAccountStep = _a.setUSDBankAccountStep;
    var styles = (0, useThemeStyles_1.default)();
    var translate = (0, useLocalize_1.default)().translate;
    var reimbursementAccount = (0, useOnyx_1.default)(ONYXKEYS_1.default.REIMBURSEMENT_ACCOUNT)[0];
    var policy = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat((_b = reimbursementAccount === null || reimbursementAccount === void 0 ? void 0 : reimbursementAccount.achData) === null || _b === void 0 ? void 0 : _b.policyID, "}"))[0];
    var account = (0, useOnyx_1.default)(ONYXKEYS_1.default.ACCOUNT)[0];
    var handleNavigateToConciergeChat = function () { return (0, Report_1.navigateToConciergeChat)(true); };
    var bankAccountState = (_d = (_c = reimbursementAccount === null || reimbursementAccount === void 0 ? void 0 : reimbursementAccount.achData) === null || _c === void 0 ? void 0 : _c.state) !== null && _d !== void 0 ? _d : '';
    // If a user tries to navigate directly to the validate page we'll show them the EnableStep
    if (bankAccountState === BankAccount_1.default.STATE.OPEN) {
        return (<ConnectedVerifiedBankAccount_1.default reimbursementAccount={reimbursementAccount} onBackButtonPress={onBackButtonPress} setShouldShowConnectedVerifiedBankAccount={setShouldShowConnectedVerifiedBankAccount} setUSDBankAccountStep={setUSDBankAccountStep} isNonUSDWorkspace={false}/>);
    }
    var maxAttemptsReached = (_e = reimbursementAccount === null || reimbursementAccount === void 0 ? void 0 : reimbursementAccount.maxAttemptsReached) !== null && _e !== void 0 ? _e : false;
    var isBankAccountVerifying = !maxAttemptsReached && bankAccountState === BankAccount_1.default.STATE.VERIFYING;
    var isBankAccountPending = bankAccountState === BankAccount_1.default.STATE.PENDING;
    var requiresTwoFactorAuth = (_f = account === null || account === void 0 ? void 0 : account.requiresTwoFactorAuth) !== null && _f !== void 0 ? _f : false;
    return (<ScreenWrapper_1.default testID={ConnectBankAccount.displayName} includeSafeAreaPaddingBottom={false} shouldEnablePickerAvoiding={false} shouldEnableMaxHeight>
            <HeaderWithBackButton_1.default title={isBankAccountPending ? translate('connectBankAccountStep.validateYourBankAccount') : translate('connectBankAccountStep.connectBankAccount')} onBackButtonPress={onBackButtonPress}/>
            {maxAttemptsReached && (<react_native_1.View style={[styles.m5, styles.flex1]}>
                    <Text_1.default>
                        {translate('connectBankAccountStep.maxAttemptsReached')} {translate('common.please')}{' '}
                        <TextLink_1.default onPress={handleNavigateToConciergeChat}>{translate('common.contactUs')}</TextLink_1.default>.
                    </Text_1.default>
                </react_native_1.View>)}
            {!maxAttemptsReached && isBankAccountPending && (<BankAccountValidationForm_1.default requiresTwoFactorAuth={requiresTwoFactorAuth} reimbursementAccount={reimbursementAccount} policy={policy}/>)}
            {isBankAccountVerifying && (<FinishChatCard_1.default requiresTwoFactorAuth={requiresTwoFactorAuth} reimbursementAccount={reimbursementAccount} setUSDBankAccountStep={setUSDBankAccountStep}/>)}
        </ScreenWrapper_1.default>);
}
ConnectBankAccount.displayName = 'ConnectBankAccount';
exports.default = ConnectBankAccount;
