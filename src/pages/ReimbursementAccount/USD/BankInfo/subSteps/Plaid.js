"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var native_1 = require("@react-navigation/native");
var react_1 = require("react");
var AddPlaidBankAccount_1 = require("@components/AddPlaidBankAccount");
var FormProvider_1 = require("@components/Form/FormProvider");
var InputWrapper_1 = require("@components/Form/InputWrapper");
var useLocalize_1 = require("@hooks/useLocalize");
var useOnyx_1 = require("@hooks/useOnyx");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var BankAccounts_1 = require("@userActions/BankAccounts");
var ReimbursementAccount_1 = require("@userActions/ReimbursementAccount");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var ReimbursementAccountForm_1 = require("@src/types/form/ReimbursementAccountForm");
var BANK_INFO_STEP_KEYS = ReimbursementAccountForm_1.default.BANK_INFO_STEP;
function Plaid(_a) {
    var _b, _c, _d, _e;
    var onNext = _a.onNext, setUSDBankAccountStep = _a.setUSDBankAccountStep;
    var reimbursementAccount = (0, useOnyx_1.default)(ONYXKEYS_1.default.REIMBURSEMENT_ACCOUNT)[0];
    var reimbursementAccountDraft = (0, useOnyx_1.default)(ONYXKEYS_1.default.FORMS.REIMBURSEMENT_ACCOUNT_FORM_DRAFT)[0];
    var plaidData = (0, useOnyx_1.default)(ONYXKEYS_1.default.PLAID_DATA)[0];
    var translate = (0, useLocalize_1.default)().translate;
    var styles = (0, useThemeStyles_1.default)();
    var isFocused = (0, native_1.useIsFocused)();
    var selectedPlaidAccountID = (_b = reimbursementAccountDraft === null || reimbursementAccountDraft === void 0 ? void 0 : reimbursementAccountDraft[BANK_INFO_STEP_KEYS.PLAID_ACCOUNT_ID]) !== null && _b !== void 0 ? _b : '';
    var handleNextPress = (0, react_1.useCallback)(function () {
        var _a;
        var _b, _c, _d;
        var selectedPlaidBankAccount = ((_b = plaidData === null || plaidData === void 0 ? void 0 : plaidData.bankAccounts) !== null && _b !== void 0 ? _b : []).find(function (account) { var _a; return (_a = account.plaidAccountID === (reimbursementAccountDraft === null || reimbursementAccountDraft === void 0 ? void 0 : reimbursementAccountDraft[BANK_INFO_STEP_KEYS.PLAID_ACCOUNT_ID])) !== null && _a !== void 0 ? _a : null; });
        var bankAccountData = (_a = {},
            _a[BANK_INFO_STEP_KEYS.ROUTING_NUMBER] = selectedPlaidBankAccount === null || selectedPlaidBankAccount === void 0 ? void 0 : selectedPlaidBankAccount[BANK_INFO_STEP_KEYS.ROUTING_NUMBER],
            _a[BANK_INFO_STEP_KEYS.ACCOUNT_NUMBER] = selectedPlaidBankAccount === null || selectedPlaidBankAccount === void 0 ? void 0 : selectedPlaidBankAccount[BANK_INFO_STEP_KEYS.ACCOUNT_NUMBER],
            _a[BANK_INFO_STEP_KEYS.PLAID_MASK] = selectedPlaidBankAccount === null || selectedPlaidBankAccount === void 0 ? void 0 : selectedPlaidBankAccount.mask,
            _a[BANK_INFO_STEP_KEYS.IS_SAVINGS] = selectedPlaidBankAccount === null || selectedPlaidBankAccount === void 0 ? void 0 : selectedPlaidBankAccount[BANK_INFO_STEP_KEYS.IS_SAVINGS],
            _a[BANK_INFO_STEP_KEYS.BANK_NAME] = (_c = plaidData === null || plaidData === void 0 ? void 0 : plaidData[BANK_INFO_STEP_KEYS.BANK_NAME]) !== null && _c !== void 0 ? _c : '',
            _a[BANK_INFO_STEP_KEYS.PLAID_ACCOUNT_ID] = selectedPlaidBankAccount === null || selectedPlaidBankAccount === void 0 ? void 0 : selectedPlaidBankAccount[BANK_INFO_STEP_KEYS.PLAID_ACCOUNT_ID],
            _a[BANK_INFO_STEP_KEYS.PLAID_ACCESS_TOKEN] = (_d = plaidData === null || plaidData === void 0 ? void 0 : plaidData[BANK_INFO_STEP_KEYS.PLAID_ACCESS_TOKEN]) !== null && _d !== void 0 ? _d : '',
            _a);
        (0, ReimbursementAccount_1.updateReimbursementAccountDraft)(bankAccountData);
        onNext(bankAccountData);
    }, [plaidData, reimbursementAccountDraft, onNext]);
    var bankAccountID = (_d = (_c = reimbursementAccount === null || reimbursementAccount === void 0 ? void 0 : reimbursementAccount.achData) === null || _c === void 0 ? void 0 : _c.bankAccountID) !== null && _d !== void 0 ? _d : CONST_1.default.DEFAULT_NUMBER_ID;
    (0, react_1.useEffect)(function () {
        var _a;
        var plaidBankAccounts = (_a = plaidData === null || plaidData === void 0 ? void 0 : plaidData.bankAccounts) !== null && _a !== void 0 ? _a : [];
        if (isFocused || plaidBankAccounts.length) {
            return;
        }
        (0, BankAccounts_1.setBankAccountSubStep)(null);
        setUSDBankAccountStep(null);
    }, [isFocused, plaidData, setUSDBankAccountStep]);
    var handlePlaidExit = function () {
        (0, BankAccounts_1.setBankAccountSubStep)(null);
        setUSDBankAccountStep(null);
    };
    return (<FormProvider_1.default formID={ONYXKEYS_1.default.FORMS.REIMBURSEMENT_ACCOUNT_FORM} validate={BankAccounts_1.validatePlaidSelection} onSubmit={handleNextPress} scrollContextEnabled submitButtonText={translate('common.next')} style={[styles.mh5, styles.flexGrow1]} isSubmitButtonVisible={((_e = plaidData === null || plaidData === void 0 ? void 0 : plaidData.bankAccounts) !== null && _e !== void 0 ? _e : []).length > 0} shouldHideFixErrorsAlert>
            <InputWrapper_1.default InputComponent={AddPlaidBankAccount_1.default} text={translate('bankAccount.plaidBodyCopy')} onSelect={function (plaidAccountID) {
            (0, ReimbursementAccount_1.updateReimbursementAccountDraft)({ plaidAccountID: plaidAccountID });
        }} plaidData={plaidData} onExitPlaid={handlePlaidExit} allowDebit bankAccountID={bankAccountID} selectedPlaidAccountID={selectedPlaidAccountID} inputID={BANK_INFO_STEP_KEYS.SELECTED_PLAID_ACCOUNT_ID} defaultValue={selectedPlaidAccountID}/>
        </FormProvider_1.default>);
}
Plaid.displayName = 'Plaid';
exports.default = Plaid;
