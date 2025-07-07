"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var CONST_1 = require("expensify-common/dist/CONST");
var react_1 = require("react");
var ConfirmationStep_1 = require("@components/SubStepForms/ConfirmationStep");
var useLocalize_1 = require("@hooks/useLocalize");
var useOnyx_1 = require("@hooks/useOnyx");
var ErrorUtils_1 = require("@libs/ErrorUtils");
var getSubStepValues_1 = require("@pages/ReimbursementAccount/utils/getSubStepValues");
var CONST_2 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var ReimbursementAccountForm_1 = require("@src/types/form/ReimbursementAccountForm");
var BUSINESS_INFO_STEP_KEYS = ReimbursementAccountForm_1.default.ADDITIONAL_DATA.CORPAY;
var _a = ReimbursementAccountForm_1.default.ADDITIONAL_DATA.CORPAY, COMPANY_NAME = _a.COMPANY_NAME, COMPANY_WEBSITE = _a.COMPANY_WEBSITE, BUSINESS_REGISTRATION_INCORPORATION_NUMBER = _a.BUSINESS_REGISTRATION_INCORPORATION_NUMBER, TAX_ID_EIN_NUMBER = _a.TAX_ID_EIN_NUMBER, COMPANY_COUNTRY_CODE = _a.COMPANY_COUNTRY_CODE, COMPANY_STREET = _a.COMPANY_STREET, COMPANY_CITY = _a.COMPANY_CITY, COMPANY_STATE = _a.COMPANY_STATE, COMPANY_POSTAL_CODE = _a.COMPANY_POSTAL_CODE, BUSINESS_CONTACT_NUMBER = _a.BUSINESS_CONTACT_NUMBER, BUSINESS_CONFIRMATION_EMAIL = _a.BUSINESS_CONFIRMATION_EMAIL, FORMATION_INCORPORATION_COUNTRY_CODE = _a.FORMATION_INCORPORATION_COUNTRY_CODE, FORMATION_INCORPORATION_STATE = _a.FORMATION_INCORPORATION_STATE, ANNUAL_VOLUME = _a.ANNUAL_VOLUME, APPLICANT_TYPE_ID = _a.APPLICANT_TYPE_ID, TRADE_VOLUME = _a.TRADE_VOLUME, BUSINESS_CATEGORY = _a.BUSINESS_CATEGORY;
var displayStringValue = function (list, matchingName) {
    var _a, _b;
    return (_b = (_a = list.find(function (item) { return item.name === matchingName; })) === null || _a === void 0 ? void 0 : _a.stringValue) !== null && _b !== void 0 ? _b : '';
};
var displayAddress = function (street, city, state, zipCode, country) {
    return country === CONST_2.default.COUNTRY.US || country === CONST_2.default.COUNTRY.CA ? "".concat(street, ", ").concat(city, ", ").concat(state, ", ").concat(zipCode, ", ").concat(country) : "".concat(street, ", ").concat(city, ", ").concat(zipCode, ", ").concat(country);
};
var displayIncorporationLocation = function (country, state) {
    var _a, _b, _c;
    var countryFullName = CONST_2.default.ALL_COUNTRIES[country];
    var stateFullName = (_b = (_a = CONST_1.CONST.STATES[state]) === null || _a === void 0 ? void 0 : _a.stateName) !== null && _b !== void 0 ? _b : (_c = CONST_1.CONST.PROVINCES[state]) === null || _c === void 0 ? void 0 : _c.provinceName;
    return country === CONST_2.default.COUNTRY.US || country === CONST_2.default.COUNTRY.CA ? "".concat(stateFullName, ", ").concat(countryFullName) : "".concat(countryFullName);
};
function Confirmation(_a) {
    var onNext = _a.onNext, onMove = _a.onMove, isEditing = _a.isEditing;
    var translate = (0, useLocalize_1.default)().translate;
    var reimbursementAccount = (0, useOnyx_1.default)(ONYXKEYS_1.default.REIMBURSEMENT_ACCOUNT, { canBeMissing: false })[0];
    var reimbursementAccountDraft = (0, useOnyx_1.default)(ONYXKEYS_1.default.FORMS.REIMBURSEMENT_ACCOUNT_FORM_DRAFT, { canBeMissing: false })[0];
    var corpayOnboardingFields = (0, useOnyx_1.default)(ONYXKEYS_1.default.CORPAY_ONBOARDING_FIELDS, { canBeMissing: false })[0];
    var error = (0, ErrorUtils_1.getLatestErrorMessage)(reimbursementAccount);
    var values = (0, react_1.useMemo)(function () { return (0, getSubStepValues_1.default)(BUSINESS_INFO_STEP_KEYS, reimbursementAccountDraft, reimbursementAccount); }, [reimbursementAccount, reimbursementAccountDraft]);
    var paymentVolume = (0, react_1.useMemo)(function () { var _a; return displayStringValue((_a = corpayOnboardingFields === null || corpayOnboardingFields === void 0 ? void 0 : corpayOnboardingFields.picklists.AnnualVolumeRange) !== null && _a !== void 0 ? _a : [], values[ANNUAL_VOLUME]); }, [corpayOnboardingFields === null || corpayOnboardingFields === void 0 ? void 0 : corpayOnboardingFields.picklists.AnnualVolumeRange, values]);
    var businessCategory = (0, react_1.useMemo)(function () { var _a; return displayStringValue((_a = corpayOnboardingFields === null || corpayOnboardingFields === void 0 ? void 0 : corpayOnboardingFields.picklists.NatureOfBusiness) !== null && _a !== void 0 ? _a : [], values[BUSINESS_CATEGORY]); }, [corpayOnboardingFields === null || corpayOnboardingFields === void 0 ? void 0 : corpayOnboardingFields.picklists.NatureOfBusiness, values]);
    var businessType = (0, react_1.useMemo)(function () { var _a; return displayStringValue((_a = corpayOnboardingFields === null || corpayOnboardingFields === void 0 ? void 0 : corpayOnboardingFields.picklists.ApplicantType) !== null && _a !== void 0 ? _a : [], values[APPLICANT_TYPE_ID]); }, [corpayOnboardingFields === null || corpayOnboardingFields === void 0 ? void 0 : corpayOnboardingFields.picklists.ApplicantType, values]);
    var tradeVolumeRange = (0, react_1.useMemo)(function () { var _a; return displayStringValue((_a = corpayOnboardingFields === null || corpayOnboardingFields === void 0 ? void 0 : corpayOnboardingFields.picklists.TradeVolumeRange) !== null && _a !== void 0 ? _a : [], values[TRADE_VOLUME]); }, [corpayOnboardingFields === null || corpayOnboardingFields === void 0 ? void 0 : corpayOnboardingFields.picklists.TradeVolumeRange, values]);
    var summaryItems = (0, react_1.useMemo)(function () { return [
        {
            title: values[COMPANY_NAME],
            description: translate('businessInfoStep.legalBusinessName'),
            shouldShowRightIcon: true,
            onPress: function () {
                onMove(0);
            },
        },
        {
            title: values[COMPANY_WEBSITE],
            description: translate('businessInfoStep.companyWebsite'),
            shouldShowRightIcon: true,
            onPress: function () {
                onMove(1);
            },
        },
        {
            title: values[BUSINESS_REGISTRATION_INCORPORATION_NUMBER],
            description: translate('businessInfoStep.registrationNumber'),
            shouldShowRightIcon: true,
            onPress: function () {
                onMove(4);
            },
        },
        {
            title: values[TAX_ID_EIN_NUMBER],
            description: translate('businessInfoStep.taxIDEIN', { country: values[COMPANY_COUNTRY_CODE] }),
            shouldShowRightIcon: true,
            onPress: function () {
                onMove(5);
            },
        },
        {
            title: displayAddress(values[COMPANY_STREET], values[COMPANY_CITY], values[COMPANY_STATE], values[COMPANY_POSTAL_CODE], values[COMPANY_COUNTRY_CODE]),
            description: translate('businessInfoStep.businessAddress'),
            shouldShowRightIcon: true,
            onPress: function () {
                onMove(2);
            },
        },
        {
            title: values[BUSINESS_CONTACT_NUMBER],
            description: translate('common.phoneNumber'),
            shouldShowRightIcon: true,
            onPress: function () {
                onMove(3);
            },
        },
        {
            title: values[BUSINESS_CONFIRMATION_EMAIL],
            description: translate('common.email'),
            shouldShowRightIcon: true,
            onPress: function () {
                onMove(3);
            },
        },
        {
            title: businessType,
            description: translate('businessInfoStep.businessType'),
            shouldShowRightIcon: true,
            onPress: function () {
                onMove(7);
            },
        },
        {
            title: displayIncorporationLocation(values[FORMATION_INCORPORATION_COUNTRY_CODE], values[FORMATION_INCORPORATION_STATE]),
            description: translate('businessInfoStep.incorporation'),
            shouldShowRightIcon: true,
            onPress: function () {
                onMove(6);
            },
        },
        {
            title: businessCategory,
            description: translate('businessInfoStep.businessCategory'),
            shouldShowRightIcon: true,
            onPress: function () {
                onMove(7);
            },
        },
        {
            title: paymentVolume,
            description: translate('businessInfoStep.annualPaymentVolume'),
            shouldShowRightIcon: true,
            onPress: function () {
                onMove(8);
            },
        },
        {
            title: tradeVolumeRange,
            description: translate('businessInfoStep.averageReimbursementAmount'),
            shouldShowRightIcon: true,
            onPress: function () {
                onMove(9);
            },
        },
    ]; }, [businessCategory, businessType, onMove, paymentVolume, tradeVolumeRange, translate, values]);
    return (<ConfirmationStep_1.default isEditing={isEditing} error={error} onNext={onNext} onMove={onMove} pageTitle={translate('businessInfoStep.letsDoubleCheck')} summaryItems={summaryItems} isLoading={reimbursementAccount === null || reimbursementAccount === void 0 ? void 0 : reimbursementAccount.isSavingCorpayOnboardingCompanyFields} showOnfidoLinks={false}/>);
}
Confirmation.displayName = 'Confirmation';
exports.default = Confirmation;
