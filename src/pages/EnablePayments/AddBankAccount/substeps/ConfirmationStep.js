"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var react_native_onyx_1 = require("react-native-onyx");
var Button_1 = require("@components/Button");
var DotIndicatorMessage_1 = require("@components/DotIndicatorMessage");
var MenuItemWithTopDescription_1 = require("@components/MenuItemWithTopDescription");
var ScrollView_1 = require("@components/ScrollView");
var Text_1 = require("@components/Text");
var useLocalize_1 = require("@hooks/useLocalize");
var useNetwork_1 = require("@hooks/useNetwork");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var ErrorUtils = require("@libs/ErrorUtils");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var PersonalBankAccountForm_1 = require("@src/types/form/PersonalBankAccountForm");
var BANK_INFO_STEP_KEYS = PersonalBankAccountForm_1.default.BANK_INFO_STEP;
var BANK_INFO_STEP_INDEXES = CONST_1.default.WALLET.SUBSTEP_INDEXES.BANK_ACCOUNT;
function ConfirmationStep(_a) {
    var _b, _c;
    var personalBankAccount = _a.personalBankAccount, personalBankAccountDraft = _a.personalBankAccountDraft, onNext = _a.onNext, onMove = _a.onMove;
    var translate = (0, useLocalize_1.default)().translate;
    var styles = (0, useThemeStyles_1.default)();
    var isOffline = (0, useNetwork_1.default)().isOffline;
    var isLoading = (_b = personalBankAccount === null || personalBankAccount === void 0 ? void 0 : personalBankAccount.isLoading) !== null && _b !== void 0 ? _b : false;
    var error = ErrorUtils.getLatestErrorMessage(personalBankAccount !== null && personalBankAccount !== void 0 ? personalBankAccount : {});
    var handleModifyAccountNumbers = function () {
        onMove(BANK_INFO_STEP_INDEXES.ACCOUNT_NUMBERS);
    };
    return (<ScrollView_1.default style={styles.pt0} contentContainerStyle={styles.flexGrow1}>
            <Text_1.default style={[styles.textHeadlineLineHeightXXL, styles.ph5]}>{translate('walletPage.confirmYourBankAccount')}</Text_1.default>
            <Text_1.default style={[styles.mt3, styles.mb3, styles.ph5, styles.textSupporting]}>{translate('bankAccount.letsDoubleCheck')}</Text_1.default>
            <MenuItemWithTopDescription_1.default description={personalBankAccountDraft === null || personalBankAccountDraft === void 0 ? void 0 : personalBankAccountDraft[BANK_INFO_STEP_KEYS.BANK_NAME]} title={"".concat(translate('bankAccount.accountEnding'), " ").concat(((_c = personalBankAccountDraft === null || personalBankAccountDraft === void 0 ? void 0 : personalBankAccountDraft[BANK_INFO_STEP_KEYS.ACCOUNT_NUMBER]) !== null && _c !== void 0 ? _c : '').slice(-4))} shouldShowRightIcon onPress={handleModifyAccountNumbers}/>
            <react_native_1.View style={[styles.ph5, styles.pb5, styles.flexGrow1, styles.justifyContentEnd]}>
                {!!error && error.length > 0 && (<DotIndicatorMessage_1.default textStyles={[styles.formError]} type="error" messages={{ error: error }}/>)}
                <Button_1.default isLoading={isLoading} isDisabled={isLoading || isOffline} success large style={[styles.w100]} onPress={onNext} text={translate('common.confirm')}/>
            </react_native_1.View>
        </ScrollView_1.default>);
}
ConfirmationStep.displayName = 'ConfirmationStep';
exports.default = (0, react_native_onyx_1.withOnyx)({
    personalBankAccountDraft: {
        key: ONYXKEYS_1.default.FORMS.PERSONAL_BANK_ACCOUNT_FORM_DRAFT,
    },
    // @ts-expect-error: ONYXKEYS.PERSONAL_BANK_ACCOUNT is conflicting with ONYXKEYS.FORMS.PERSONAL_BANK_ACCOUNT_FORM
    personalBankAccount: {
        key: ONYXKEYS_1.default.PERSONAL_BANK_ACCOUNT,
    },
    userWallet: {
        key: ONYXKEYS_1.default.USER_WALLET,
    },
})(ConfirmationStep);
