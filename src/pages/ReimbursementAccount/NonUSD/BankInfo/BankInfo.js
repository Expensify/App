"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var InteractiveStepWrapper_1 = require("@components/InteractiveStepWrapper");
var useLocalize_1 = require("@hooks/useLocalize");
var useNetwork_1 = require("@hooks/useNetwork");
var useOnyx_1 = require("@hooks/useOnyx");
var useSubStep_1 = require("@hooks/useSubStep");
var NotFoundPage_1 = require("@pages/ErrorPage/NotFoundPage");
var getBankInfoStepValues_1 = require("@pages/ReimbursementAccount/NonUSD/utils/getBankInfoStepValues");
var getInitialSubStepForBankInfoStep_1 = require("@pages/ReimbursementAccount/NonUSD/utils/getInitialSubStepForBankInfoStep");
var getInputKeysForBankInfoStep_1 = require("@pages/ReimbursementAccount/NonUSD/utils/getInputKeysForBankInfoStep");
var BankAccounts_1 = require("@userActions/BankAccounts");
var FormActions_1 = require("@userActions/FormActions");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var ReimbursementAccountForm_1 = require("@src/types/form/ReimbursementAccountForm");
var AccountHolderDetails_1 = require("./subSteps/AccountHolderDetails");
var BankAccountDetails_1 = require("./subSteps/BankAccountDetails");
var Confirmation_1 = require("./subSteps/Confirmation");
var COUNTRY = ReimbursementAccountForm_1.default.ADDITIONAL_DATA.COUNTRY;
function BankInfo(_a) {
    var _b, _c, _d, _e;
    var onBackButtonPress = _a.onBackButtonPress, onSubmit = _a.onSubmit, policyID = _a.policyID;
    var translate = (0, useLocalize_1.default)().translate;
    var reimbursementAccount = (0, useOnyx_1.default)(ONYXKEYS_1.default.REIMBURSEMENT_ACCOUNT, { canBeMissing: false })[0];
    var reimbursementAccountDraft = (0, useOnyx_1.default)(ONYXKEYS_1.default.FORMS.REIMBURSEMENT_ACCOUNT_FORM_DRAFT, { canBeMissing: true })[0];
    var corpayFields = (0, useOnyx_1.default)(ONYXKEYS_1.default.CORPAY_FIELDS, { canBeMissing: true })[0];
    var policy = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID), { canBeMissing: false })[0];
    var currency = (_b = policy === null || policy === void 0 ? void 0 : policy.outputCurrency) !== null && _b !== void 0 ? _b : '';
    var country = (_e = (_c = reimbursementAccountDraft === null || reimbursementAccountDraft === void 0 ? void 0 : reimbursementAccountDraft[COUNTRY]) !== null && _c !== void 0 ? _c : (_d = reimbursementAccount === null || reimbursementAccount === void 0 ? void 0 : reimbursementAccount.achData) === null || _d === void 0 ? void 0 : _d[COUNTRY]) !== null && _e !== void 0 ? _e : '';
    var inputKeys = (0, getInputKeysForBankInfoStep_1.default)(corpayFields);
    var values = (0, react_1.useMemo)(function () { return (0, getBankInfoStepValues_1.getBankInfoStepValues)(inputKeys, reimbursementAccountDraft, reimbursementAccount); }, [inputKeys, reimbursementAccount, reimbursementAccountDraft]);
    var startFrom = (0, react_1.useMemo)(function () { return (0, getInitialSubStepForBankInfoStep_1.default)(values, corpayFields); }, [corpayFields, values]);
    var submit = function () {
        var _a = corpayFields !== null && corpayFields !== void 0 ? corpayFields : {}, formFields = _a.formFields, isLoading = _a.isLoading, isSuccess = _a.isSuccess, corpayData = __rest(_a, ["formFields", "isLoading", "isSuccess"]);
        (0, BankAccounts_1.createCorpayBankAccount)(__assign(__assign({}, values), corpayData), policyID);
    };
    (0, useNetwork_1.default)({
        onReconnect: function () {
            (0, BankAccounts_1.getCorpayBankAccountFields)(country, currency);
        },
    });
    (0, react_1.useEffect)(function () {
        if ((reimbursementAccount === null || reimbursementAccount === void 0 ? void 0 : reimbursementAccount.isLoading) === true || !!(reimbursementAccount === null || reimbursementAccount === void 0 ? void 0 : reimbursementAccount.errors)) {
            return;
        }
        if ((reimbursementAccount === null || reimbursementAccount === void 0 ? void 0 : reimbursementAccount.isSuccess) === true) {
            onSubmit();
            (0, BankAccounts_1.clearReimbursementAccountBankCreation)();
        }
    }, [corpayFields === null || corpayFields === void 0 ? void 0 : corpayFields.bankCurrency, country, currency, onSubmit, reimbursementAccount === null || reimbursementAccount === void 0 ? void 0 : reimbursementAccount.errors, reimbursementAccount === null || reimbursementAccount === void 0 ? void 0 : reimbursementAccount.isLoading, reimbursementAccount === null || reimbursementAccount === void 0 ? void 0 : reimbursementAccount.isSuccess]);
    (0, react_1.useEffect)(function () {
        // No fetching when there is no country
        if (country === '') {
            return;
        }
        // When workspace currency is set to EUR we need to refetch if country from Step 1 doesn't match country inside fetched Corpay data
        if (currency === CONST_1.default.CURRENCY.EUR && country !== (corpayFields === null || corpayFields === void 0 ? void 0 : corpayFields.bankCountry)) {
            (0, BankAccounts_1.getCorpayBankAccountFields)(country, currency);
            return;
        }
        // No fetching when workspace currency matches the currency inside fetched Corpay
        if (currency === (corpayFields === null || corpayFields === void 0 ? void 0 : corpayFields.bankCurrency)) {
            return;
        }
        (0, BankAccounts_1.getCorpayBankAccountFields)(country, currency);
    }, [corpayFields === null || corpayFields === void 0 ? void 0 : corpayFields.bankCurrency, corpayFields === null || corpayFields === void 0 ? void 0 : corpayFields.bankCountry, country, currency]);
    var bodyContent = [BankAccountDetails_1.default, AccountHolderDetails_1.default, Confirmation_1.default];
    var _f = (0, useSubStep_1.default)({ bodyContent: bodyContent, startFrom: startFrom, onFinished: submit }), SubStep = _f.componentToRender, isEditing = _f.isEditing, screenIndex = _f.screenIndex, nextScreen = _f.nextScreen, prevScreen = _f.prevScreen, moveTo = _f.moveTo, goToTheLastStep = _f.goToTheLastStep;
    var handleBackButtonPress = function () {
        (0, FormActions_1.clearErrors)(ONYXKEYS_1.default.FORMS.REIMBURSEMENT_ACCOUNT_FORM);
        if (isEditing) {
            goToTheLastStep();
            return;
        }
        if (screenIndex === 0) {
            onBackButtonPress();
        }
        else {
            prevScreen();
        }
    };
    if (corpayFields !== undefined && (corpayFields === null || corpayFields === void 0 ? void 0 : corpayFields.isLoading) === false && (corpayFields === null || corpayFields === void 0 ? void 0 : corpayFields.isSuccess) !== undefined && (corpayFields === null || corpayFields === void 0 ? void 0 : corpayFields.isSuccess) === false) {
        return <NotFoundPage_1.default />;
    }
    return (<InteractiveStepWrapper_1.default wrapperID={BankInfo.displayName} handleBackButtonPress={handleBackButtonPress} headerTitle={translate('bankAccount.bankInfo')} stepNames={CONST_1.default.NON_USD_BANK_ACCOUNT.STEP_NAMES} startStepIndex={1}>
            <SubStep isEditing={isEditing} onNext={nextScreen} onMove={moveTo} corpayFields={corpayFields}/>
        </InteractiveStepWrapper_1.default>);
}
BankInfo.displayName = 'BankInfo';
exports.default = BankInfo;
