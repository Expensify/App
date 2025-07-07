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
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var InteractiveStepWrapper_1 = require("@components/InteractiveStepWrapper");
var useLocalize_1 = require("@hooks/useLocalize");
var useOnyx_1 = require("@hooks/useOnyx");
var useSubStep_1 = require("@hooks/useSubStep");
var getInitialSubStepForBusinessInfoStep_1 = require("@pages/ReimbursementAccount/NonUSD/utils/getInitialSubStepForBusinessInfoStep");
var getSubStepValues_1 = require("@pages/ReimbursementAccount/utils/getSubStepValues");
var BankAccounts_1 = require("@userActions/BankAccounts");
var FormActions_1 = require("@userActions/FormActions");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var ReimbursementAccountForm_1 = require("@src/types/form/ReimbursementAccountForm");
var Address_1 = require("./subSteps/Address");
var AverageReimbursement_1 = require("./subSteps/AverageReimbursement");
var BusinessType_1 = require("./subSteps/BusinessType");
var Confirmation_1 = require("./subSteps/Confirmation");
var ContactInformation_1 = require("./subSteps/ContactInformation");
var IncorporationLocation_1 = require("./subSteps/IncorporationLocation");
var Name_1 = require("./subSteps/Name");
var PaymentVolume_1 = require("./subSteps/PaymentVolume");
var RegistrationNumber_1 = require("./subSteps/RegistrationNumber");
var TaxIDEINNumber_1 = require("./subSteps/TaxIDEINNumber");
var Website_1 = require("./subSteps/Website");
var bodyContent = [
    Name_1.default,
    Website_1.default,
    Address_1.default,
    ContactInformation_1.default,
    RegistrationNumber_1.default,
    TaxIDEINNumber_1.default,
    IncorporationLocation_1.default,
    BusinessType_1.default,
    PaymentVolume_1.default,
    AverageReimbursement_1.default,
    Confirmation_1.default,
];
var INPUT_KEYS = {
    NAME: ReimbursementAccountForm_1.default.ADDITIONAL_DATA.CORPAY.COMPANY_NAME,
    WEBSITE: ReimbursementAccountForm_1.default.ADDITIONAL_DATA.CORPAY.COMPANY_WEBSITE,
    STREET: ReimbursementAccountForm_1.default.ADDITIONAL_DATA.CORPAY.COMPANY_STREET,
    CITY: ReimbursementAccountForm_1.default.ADDITIONAL_DATA.CORPAY.COMPANY_CITY,
    STATE: ReimbursementAccountForm_1.default.ADDITIONAL_DATA.CORPAY.COMPANY_STATE,
    COMPANY_POSTAL_CODE: ReimbursementAccountForm_1.default.ADDITIONAL_DATA.CORPAY.COMPANY_POSTAL_CODE,
    COMPANY_COUNTRY_CODE: ReimbursementAccountForm_1.default.ADDITIONAL_DATA.CORPAY.COMPANY_COUNTRY_CODE,
    CONTACT_NUMBER: ReimbursementAccountForm_1.default.ADDITIONAL_DATA.CORPAY.BUSINESS_CONTACT_NUMBER,
    CONFIRMATION_EMAIL: ReimbursementAccountForm_1.default.ADDITIONAL_DATA.CORPAY.BUSINESS_CONFIRMATION_EMAIL,
    INCORPORATION_STATE: ReimbursementAccountForm_1.default.ADDITIONAL_DATA.CORPAY.FORMATION_INCORPORATION_STATE,
    INCORPORATION_COUNTRY: ReimbursementAccountForm_1.default.ADDITIONAL_DATA.CORPAY.FORMATION_INCORPORATION_COUNTRY_CODE,
    BUSINESS_REGISTRATION_INCORPORATION_NUMBER: ReimbursementAccountForm_1.default.ADDITIONAL_DATA.CORPAY.BUSINESS_REGISTRATION_INCORPORATION_NUMBER,
    BUSINESS_CATEGORY: ReimbursementAccountForm_1.default.ADDITIONAL_DATA.CORPAY.BUSINESS_CATEGORY,
    APPLICANT_TYPE_ID: ReimbursementAccountForm_1.default.ADDITIONAL_DATA.CORPAY.APPLICANT_TYPE_ID,
    ANNUAL_VOLUME: ReimbursementAccountForm_1.default.ADDITIONAL_DATA.CORPAY.ANNUAL_VOLUME,
    TRADE_VOLUME: ReimbursementAccountForm_1.default.ADDITIONAL_DATA.CORPAY.TRADE_VOLUME,
    TAX_ID_EIN_NUMBER: ReimbursementAccountForm_1.default.ADDITIONAL_DATA.CORPAY.TAX_ID_EIN_NUMBER,
};
function BusinessInfo(_a) {
    var _b, _c, _d, _e, _f, _g, _h;
    var onBackButtonPress = _a.onBackButtonPress, onSubmit = _a.onSubmit;
    var translate = (0, useLocalize_1.default)().translate;
    var reimbursementAccount = (0, useOnyx_1.default)(ONYXKEYS_1.default.REIMBURSEMENT_ACCOUNT, { canBeMissing: false })[0];
    var reimbursementAccountDraft = (0, useOnyx_1.default)(ONYXKEYS_1.default.FORMS.REIMBURSEMENT_ACCOUNT_FORM_DRAFT, { canBeMissing: true })[0];
    var policyID = (_b = reimbursementAccount === null || reimbursementAccount === void 0 ? void 0 : reimbursementAccount.achData) === null || _b === void 0 ? void 0 : _b.policyID;
    var policy = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID), { canBeMissing: false })[0];
    var currency = (_c = policy === null || policy === void 0 ? void 0 : policy.outputCurrency) !== null && _c !== void 0 ? _c : '';
    var businessInfoStepValues = (0, react_1.useMemo)(function () { return (0, getSubStepValues_1.default)(INPUT_KEYS, reimbursementAccountDraft, reimbursementAccount); }, [reimbursementAccount, reimbursementAccountDraft]);
    var bankAccountID = (_e = (_d = reimbursementAccount === null || reimbursementAccount === void 0 ? void 0 : reimbursementAccount.achData) === null || _d === void 0 ? void 0 : _d.bankAccountID) !== null && _e !== void 0 ? _e : CONST_1.default.DEFAULT_NUMBER_ID;
    var startFrom = (0, react_1.useMemo)(function () { return (0, getInitialSubStepForBusinessInfoStep_1.default)(businessInfoStepValues); }, [businessInfoStepValues]);
    var country = (_h = (_g = (_f = reimbursementAccount === null || reimbursementAccount === void 0 ? void 0 : reimbursementAccount.achData) === null || _f === void 0 ? void 0 : _f[ReimbursementAccountForm_1.default.ADDITIONAL_DATA.COUNTRY]) !== null && _g !== void 0 ? _g : reimbursementAccountDraft === null || reimbursementAccountDraft === void 0 ? void 0 : reimbursementAccountDraft[ReimbursementAccountForm_1.default.ADDITIONAL_DATA.COUNTRY]) !== null && _h !== void 0 ? _h : '';
    (0, react_1.useEffect)(function () {
        (0, BankAccounts_1.getCorpayOnboardingFields)(country);
    }, [country]);
    var submit = (0, react_1.useCallback)(function () {
        (0, BankAccounts_1.saveCorpayOnboardingCompanyDetails)(__assign(__assign({}, businessInfoStepValues), { fundSourceCountries: country, fundDestinationCountries: country, currencyNeeded: currency, purposeOfTransactionId: CONST_1.default.NON_USD_BANK_ACCOUNT.PURPOSE_OF_TRANSACTION_ID }), bankAccountID);
    }, [country, currency, bankAccountID, businessInfoStepValues]);
    (0, react_1.useEffect)(function () {
        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
        if ((reimbursementAccount === null || reimbursementAccount === void 0 ? void 0 : reimbursementAccount.errors) || (reimbursementAccount === null || reimbursementAccount === void 0 ? void 0 : reimbursementAccount.isSavingCorpayOnboardingCompanyFields) || !(reimbursementAccount === null || reimbursementAccount === void 0 ? void 0 : reimbursementAccount.isSuccess)) {
            return;
        }
        if (reimbursementAccount === null || reimbursementAccount === void 0 ? void 0 : reimbursementAccount.isSuccess) {
            onSubmit();
            (0, BankAccounts_1.clearReimbursementAccountSaveCorpayOnboardingCompanyDetails)();
        }
        return function () {
            (0, BankAccounts_1.clearReimbursementAccountSaveCorpayOnboardingCompanyDetails)();
        };
    }, [reimbursementAccount, onSubmit]);
    var _j = (0, useSubStep_1.default)({ bodyContent: bodyContent, startFrom: startFrom, onFinished: submit }), SubStep = _j.componentToRender, isEditing = _j.isEditing, screenIndex = _j.screenIndex, nextScreen = _j.nextScreen, prevScreen = _j.prevScreen, moveTo = _j.moveTo, goToTheLastStep = _j.goToTheLastStep;
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
    return (<InteractiveStepWrapper_1.default wrapperID={BusinessInfo.displayName} handleBackButtonPress={handleBackButtonPress} headerTitle={translate('businessInfoStep.businessInfoTitle')} stepNames={CONST_1.default.NON_USD_BANK_ACCOUNT.STEP_NAMES} startStepIndex={2}>
            <SubStep isEditing={isEditing} onNext={nextScreen} onMove={moveTo} screenIndex={screenIndex}/>
        </InteractiveStepWrapper_1.default>);
}
BusinessInfo.displayName = 'BusinessInfo';
exports.default = BusinessInfo;
