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
exports.acceptWalletTerms = exports.verifyIdentity = exports.answerQuestionsForWallet = exports.openOnfidoFlow = exports.openPlaidBankLogin = exports.openPlaidBankAccountSelector = exports.cancelResetBankAccount = exports.requestResetBankAccount = exports.updateReimbursementAccountDraft = exports.setBankAccountSubStep = exports.hideBankAccountErrors = exports.resetNonUSDBankAccount = exports.resetUSDBankAccount = exports.resetReimbursementAccount = exports.setBankAccountFormValidationErrors = exports.goToWithdrawalAccountSetupStep = void 0;
exports.acceptACHContractForBankAccount = acceptACHContractForBankAccount;
exports.addBusinessWebsiteForDraft = addBusinessWebsiteForDraft;
exports.addPersonalBankAccount = addPersonalBankAccount;
exports.clearOnfidoToken = clearOnfidoToken;
exports.clearPersonalBankAccount = clearPersonalBankAccount;
exports.setPlaidEvent = setPlaidEvent;
exports.openPlaidView = openPlaidView;
exports.connectBankAccountManually = connectBankAccountManually;
exports.connectBankAccountWithPlaid = connectBankAccountWithPlaid;
exports.createCorpayBankAccount = createCorpayBankAccount;
exports.deletePaymentBankAccount = deletePaymentBankAccount;
exports.handlePlaidError = handlePlaidError;
exports.setPersonalBankAccountContinueKYCOnSuccess = setPersonalBankAccountContinueKYCOnSuccess;
exports.openPersonalBankAccountSetupView = openPersonalBankAccountSetupView;
exports.openReimbursementAccountPage = openReimbursementAccountPage;
exports.updateBeneficialOwnersForBankAccount = updateBeneficialOwnersForBankAccount;
exports.updateCompanyInformationForBankAccount = updateCompanyInformationForBankAccount;
exports.updatePersonalInformationForBankAccount = updatePersonalInformationForBankAccount;
exports.openWorkspaceView = openWorkspaceView;
exports.validateBankAccount = validateBankAccount;
exports.verifyIdentityForBankAccount = verifyIdentityForBankAccount;
exports.setReimbursementAccountLoading = setReimbursementAccountLoading;
exports.openPersonalBankAccountSetupWithPlaid = openPersonalBankAccountSetupWithPlaid;
exports.updateAddPersonalBankAccountDraft = updateAddPersonalBankAccountDraft;
exports.clearPersonalBankAccountSetupType = clearPersonalBankAccountSetupType;
exports.validatePlaidSelection = validatePlaidSelection;
exports.fetchCorpayFields = fetchCorpayFields;
exports.clearReimbursementAccountBankCreation = clearReimbursementAccountBankCreation;
exports.getCorpayBankAccountFields = getCorpayBankAccountFields;
exports.createCorpayBankAccountForWalletFlow = createCorpayBankAccountForWalletFlow;
exports.getCorpayOnboardingFields = getCorpayOnboardingFields;
exports.saveCorpayOnboardingCompanyDetails = saveCorpayOnboardingCompanyDetails;
exports.clearReimbursementAccountSaveCorpayOnboardingCompanyDetails = clearReimbursementAccountSaveCorpayOnboardingCompanyDetails;
exports.saveCorpayOnboardingBeneficialOwners = saveCorpayOnboardingBeneficialOwners;
exports.saveCorpayOnboardingDirectorInformation = saveCorpayOnboardingDirectorInformation;
exports.clearReimbursementAccountSaveCorpayOnboardingBeneficialOwners = clearReimbursementAccountSaveCorpayOnboardingBeneficialOwners;
exports.clearReimbursementAccountSaveCorpayOnboardingDirectorInformation = clearReimbursementAccountSaveCorpayOnboardingDirectorInformation;
exports.clearCorpayBankAccountFields = clearCorpayBankAccountFields;
exports.finishCorpayBankAccountOnboarding = finishCorpayBankAccountOnboarding;
exports.clearReimbursementAccountFinishCorpayBankAccountOnboarding = clearReimbursementAccountFinishCorpayBankAccountOnboarding;
var react_native_onyx_1 = require("react-native-onyx");
var API = require("@libs/API");
var types_1 = require("@libs/API/types");
var ErrorUtils_1 = require("@libs/ErrorUtils");
var Localize_1 = require("@libs/Localize");
var Navigation_1 = require("@libs/Navigation/Navigation");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var ROUTES_1 = require("@src/ROUTES");
var ReimbursementAccount_1 = require("./ReimbursementAccount");
var ReimbursementAccount_2 = require("./ReimbursementAccount");
Object.defineProperty(exports, "goToWithdrawalAccountSetupStep", { enumerable: true, get: function () { return ReimbursementAccount_2.goToWithdrawalAccountSetupStep; } });
Object.defineProperty(exports, "setBankAccountFormValidationErrors", { enumerable: true, get: function () { return ReimbursementAccount_2.setBankAccountFormValidationErrors; } });
Object.defineProperty(exports, "resetReimbursementAccount", { enumerable: true, get: function () { return ReimbursementAccount_2.resetReimbursementAccount; } });
Object.defineProperty(exports, "resetUSDBankAccount", { enumerable: true, get: function () { return ReimbursementAccount_2.resetUSDBankAccount; } });
Object.defineProperty(exports, "resetNonUSDBankAccount", { enumerable: true, get: function () { return ReimbursementAccount_2.resetNonUSDBankAccount; } });
Object.defineProperty(exports, "hideBankAccountErrors", { enumerable: true, get: function () { return ReimbursementAccount_2.hideBankAccountErrors; } });
Object.defineProperty(exports, "setBankAccountSubStep", { enumerable: true, get: function () { return ReimbursementAccount_2.setBankAccountSubStep; } });
Object.defineProperty(exports, "updateReimbursementAccountDraft", { enumerable: true, get: function () { return ReimbursementAccount_2.updateReimbursementAccountDraft; } });
Object.defineProperty(exports, "requestResetBankAccount", { enumerable: true, get: function () { return ReimbursementAccount_2.requestResetBankAccount; } });
Object.defineProperty(exports, "cancelResetBankAccount", { enumerable: true, get: function () { return ReimbursementAccount_2.cancelResetBankAccount; } });
var Plaid_1 = require("./Plaid");
Object.defineProperty(exports, "openPlaidBankAccountSelector", { enumerable: true, get: function () { return Plaid_1.openPlaidBankAccountSelector; } });
Object.defineProperty(exports, "openPlaidBankLogin", { enumerable: true, get: function () { return Plaid_1.openPlaidBankLogin; } });
var Wallet_1 = require("./Wallet");
Object.defineProperty(exports, "openOnfidoFlow", { enumerable: true, get: function () { return Wallet_1.openOnfidoFlow; } });
Object.defineProperty(exports, "answerQuestionsForWallet", { enumerable: true, get: function () { return Wallet_1.answerQuestionsForWallet; } });
Object.defineProperty(exports, "verifyIdentity", { enumerable: true, get: function () { return Wallet_1.verifyIdentity; } });
Object.defineProperty(exports, "acceptWalletTerms", { enumerable: true, get: function () { return Wallet_1.acceptWalletTerms; } });
function clearPlaid() {
    react_native_onyx_1.default.set(ONYXKEYS_1.default.PLAID_LINK_TOKEN, '');
    react_native_onyx_1.default.set(ONYXKEYS_1.default.PLAID_CURRENT_EVENT, null);
    return react_native_onyx_1.default.set(ONYXKEYS_1.default.PLAID_DATA, CONST_1.default.PLAID.DEFAULT_DATA);
}
function clearInternationalBankAccount() {
    return clearPlaid()
        .then(function () { return react_native_onyx_1.default.set(ONYXKEYS_1.default.CORPAY_FIELDS, null); })
        .then(function () { return react_native_onyx_1.default.set(ONYXKEYS_1.default.FORMS.INTERNATIONAL_BANK_ACCOUNT_FORM_DRAFT, null); });
}
function openPlaidView() {
    clearPlaid().then(function () { return (0, ReimbursementAccount_1.setBankAccountSubStep)(CONST_1.default.BANK_ACCOUNT.SETUP_TYPE.PLAID); });
}
function setPlaidEvent(eventName) {
    react_native_onyx_1.default.set(ONYXKEYS_1.default.PLAID_CURRENT_EVENT, eventName);
}
/**
 * Open the personal bank account setup flow, with an optional exitReportID to redirect to once the flow is finished.
 */
function openPersonalBankAccountSetupView(exitReportID, policyID, source, isUserValidated) {
    if (isUserValidated === void 0) { isUserValidated = true; }
    clearInternationalBankAccount().then(function () {
        if (exitReportID) {
            react_native_onyx_1.default.merge(ONYXKEYS_1.default.PERSONAL_BANK_ACCOUNT, { exitReportID: exitReportID });
        }
        if (policyID) {
            react_native_onyx_1.default.merge(ONYXKEYS_1.default.PERSONAL_BANK_ACCOUNT, { policyID: policyID });
        }
        if (source) {
            react_native_onyx_1.default.merge(ONYXKEYS_1.default.PERSONAL_BANK_ACCOUNT, { source: source });
        }
        if (!isUserValidated) {
            Navigation_1.default.navigate(ROUTES_1.default.SETTINGS_CONTACT_METHOD_VERIFY_ACCOUNT.getRoute(Navigation_1.default.getActiveRoute(), ROUTES_1.default.SETTINGS_ADD_BANK_ACCOUNT.route));
            return;
        }
        Navigation_1.default.navigate(ROUTES_1.default.SETTINGS_ADD_BANK_ACCOUNT.getRoute(Navigation_1.default.getActiveRoute()));
    });
}
/**
 * Open the personal bank account setup flow using Plaid, with an optional exitReportID to redirect to once the flow is finished.
 */
function openPersonalBankAccountSetupWithPlaid(exitReportID) {
    clearPlaid().then(function () {
        if (exitReportID) {
            react_native_onyx_1.default.merge(ONYXKEYS_1.default.PERSONAL_BANK_ACCOUNT, { exitReportID: exitReportID });
        }
        react_native_onyx_1.default.merge(ONYXKEYS_1.default.FORMS.PERSONAL_BANK_ACCOUNT_FORM_DRAFT, { setupType: CONST_1.default.BANK_ACCOUNT.SETUP_TYPE.PLAID });
    });
}
function clearPersonalBankAccountSetupType() {
    react_native_onyx_1.default.merge(ONYXKEYS_1.default.FORMS.PERSONAL_BANK_ACCOUNT_FORM_DRAFT, { setupType: null });
}
/**
 * Whether after adding a bank account we should continue with the KYC flow. If so, we must specify the fallback route.
 */
function setPersonalBankAccountContinueKYCOnSuccess(onSuccessFallbackRoute) {
    react_native_onyx_1.default.merge(ONYXKEYS_1.default.PERSONAL_BANK_ACCOUNT, { onSuccessFallbackRoute: onSuccessFallbackRoute });
}
function clearPersonalBankAccount() {
    clearPlaid();
    react_native_onyx_1.default.set(ONYXKEYS_1.default.PERSONAL_BANK_ACCOUNT, null);
    react_native_onyx_1.default.set(ONYXKEYS_1.default.FORMS.PERSONAL_BANK_ACCOUNT_FORM_DRAFT, null);
    clearPersonalBankAccountSetupType();
}
function clearOnfidoToken() {
    react_native_onyx_1.default.merge(ONYXKEYS_1.default.ONFIDO_TOKEN, '');
    react_native_onyx_1.default.merge(ONYXKEYS_1.default.ONFIDO_APPLICANT_ID, '');
}
function updateAddPersonalBankAccountDraft(bankData) {
    react_native_onyx_1.default.merge(ONYXKEYS_1.default.FORMS.PERSONAL_BANK_ACCOUNT_FORM_DRAFT, bankData);
}
/**
 * Helper method to build the Onyx data required during setup of a Verified Business Bank Account
 */
function getVBBADataForOnyx(currentStep, shouldShowLoading) {
    if (shouldShowLoading === void 0) { shouldShowLoading = true; }
    return {
        optimisticData: [
            {
                onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
                key: ONYXKEYS_1.default.REIMBURSEMENT_ACCOUNT,
                value: {
                    isLoading: shouldShowLoading,
                    errors: null,
                },
            },
        ],
        successData: [
            {
                onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
                key: ONYXKEYS_1.default.REIMBURSEMENT_ACCOUNT,
                value: {
                    isLoading: false,
                    errors: null,
                    // When setting up a bank account, we save the draft form values in Onyx.
                    // When we update the information for a step, the value of some fields that are returned from the API
                    // can be different from the value that we stored as the draft in Onyx (i.e. the phone number is formatted).
                    // This is why we store the current step used to call the API in order to update the corresponding draft data in Onyx.
                    // If currentStep is undefined that means this step don't need to update the data of the draft in Onyx.
                    draftStep: currentStep,
                },
            },
        ],
        failureData: [
            {
                onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
                key: ONYXKEYS_1.default.REIMBURSEMENT_ACCOUNT,
                value: {
                    isLoading: false,
                    errors: (0, ErrorUtils_1.getMicroSecondOnyxErrorWithTranslationKey)('walletPage.addBankAccountFailure'),
                },
            },
        ],
    };
}
function addBusinessWebsiteForDraft(websiteUrl) {
    react_native_onyx_1.default.merge(ONYXKEYS_1.default.FORMS.REIMBURSEMENT_ACCOUNT_FORM_DRAFT, { website: websiteUrl });
}
/**
 * Submit Bank Account step with Plaid data so php can perform some checks.
 */
function connectBankAccountWithPlaid(bankAccountID, selectedPlaidBankAccount, policyID) {
    var parameters = {
        bankAccountID: bankAccountID,
        routingNumber: selectedPlaidBankAccount.routingNumber,
        accountNumber: selectedPlaidBankAccount.accountNumber,
        bank: selectedPlaidBankAccount.bankName,
        plaidAccountID: selectedPlaidBankAccount.plaidAccountID,
        plaidAccessToken: selectedPlaidBankAccount.plaidAccessToken,
        plaidMask: selectedPlaidBankAccount.mask,
        isSavings: selectedPlaidBankAccount.isSavings,
        policyID: policyID,
    };
    API.write(types_1.WRITE_COMMANDS.CONNECT_BANK_ACCOUNT_WITH_PLAID, parameters, getVBBADataForOnyx());
}
/**
 * Adds a bank account via Plaid
 *
 * TODO: offline pattern for this command will have to be added later once the pattern B design doc is complete
 */
function addPersonalBankAccount(account, policyID, source) {
    var _a, _b;
    var parameters = {
        addressName: (_a = account.addressName) !== null && _a !== void 0 ? _a : '',
        routingNumber: account.routingNumber,
        accountNumber: account.accountNumber,
        isSavings: (_b = account.isSavings) !== null && _b !== void 0 ? _b : false,
        setupType: 'plaid',
        bank: account.bankName,
        plaidAccountID: account.plaidAccountID,
        plaidAccessToken: account.plaidAccessToken,
    };
    if (policyID) {
        parameters.policyID = policyID;
    }
    if (source) {
        parameters.source = source;
    }
    var onyxData = {
        optimisticData: [
            {
                onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
                key: ONYXKEYS_1.default.PERSONAL_BANK_ACCOUNT,
                value: {
                    isLoading: true,
                    errors: null,
                    plaidAccountID: account.plaidAccountID,
                },
            },
        ],
        successData: [
            {
                onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
                key: ONYXKEYS_1.default.PERSONAL_BANK_ACCOUNT,
                value: {
                    isLoading: false,
                    errors: null,
                    shouldShowSuccess: true,
                },
            },
            {
                onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
                key: ONYXKEYS_1.default.USER_WALLET,
                value: {
                    currentStep: CONST_1.default.WALLET.STEP.ADDITIONAL_DETAILS,
                },
            },
        ],
        failureData: [
            {
                onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
                key: ONYXKEYS_1.default.PERSONAL_BANK_ACCOUNT,
                value: {
                    isLoading: false,
                    errors: (0, ErrorUtils_1.getMicroSecondOnyxErrorWithTranslationKey)('walletPage.addBankAccountFailure'),
                },
            },
        ],
    };
    API.write(types_1.WRITE_COMMANDS.ADD_PERSONAL_BANK_ACCOUNT, parameters, onyxData);
}
function deletePaymentBankAccount(bankAccountID) {
    var _a, _b;
    var parameters = { bankAccountID: bankAccountID };
    var onyxData = {
        optimisticData: [
            {
                onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
                key: "".concat(ONYXKEYS_1.default.BANK_ACCOUNT_LIST),
                value: (_a = {}, _a[bankAccountID] = { pendingAction: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.DELETE }, _a),
            },
        ],
        // Sometimes pusher updates aren't received when we close the App while still offline,
        // so we are setting the bankAccount to null here to ensure that it gets cleared out once we come back online.
        successData: [
            {
                onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
                key: "".concat(ONYXKEYS_1.default.BANK_ACCOUNT_LIST),
                value: (_b = {}, _b[bankAccountID] = null, _b),
            },
        ],
    };
    API.write(types_1.WRITE_COMMANDS.DELETE_PAYMENT_BANK_ACCOUNT, parameters, onyxData);
}
/**
 * Update the user's personal information on the bank account in database.
 *
 * This action is called by the requestor step in the Verified Bank Account flow
 * @param bankAccountID - ID for bank account
 * @param params - User personal data
 * @param policyID - ID of the policy we're setting the bank account on
 * @param isConfirmPage - If we're submitting from the confirmation substep, to trigger all external checks
 */
function updatePersonalInformationForBankAccount(bankAccountID, params, policyID, isConfirmPage) {
    if (!policyID) {
        return;
    }
    API.write(types_1.WRITE_COMMANDS.UPDATE_PERSONAL_INFORMATION_FOR_BANK_ACCOUNT, __assign(__assign({}, params), { bankAccountID: bankAccountID, policyID: policyID, confirm: isConfirmPage }), getVBBADataForOnyx(CONST_1.default.BANK_ACCOUNT.STEP.REQUESTOR, isConfirmPage));
}
function validateBankAccount(bankAccountID, validateCode, policyID) {
    var parameters = {
        bankAccountID: bankAccountID,
        validateCode: validateCode,
        policyID: policyID,
    };
    var onyxData = {
        optimisticData: [
            {
                onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
                key: ONYXKEYS_1.default.REIMBURSEMENT_ACCOUNT,
                value: {
                    isLoading: true,
                    errors: null,
                },
            },
        ],
        successData: [
            {
                onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
                key: ONYXKEYS_1.default.REIMBURSEMENT_ACCOUNT,
                value: {
                    isLoading: false,
                },
            },
        ],
        failureData: [
            {
                onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
                key: ONYXKEYS_1.default.REIMBURSEMENT_ACCOUNT,
                value: {
                    isLoading: false,
                    errors: (0, ErrorUtils_1.getMicroSecondOnyxErrorWithTranslationKey)('common.genericErrorMessage'),
                },
            },
        ],
    };
    API.write(types_1.WRITE_COMMANDS.VALIDATE_BANK_ACCOUNT_WITH_TRANSACTIONS, parameters, onyxData);
}
function getCorpayBankAccountFields(country, currency) {
    var parameters = {
        countryISO: country,
        currency: currency,
        isWithdrawal: true,
        isBusinessBankAccount: true,
    };
    var onyxData = {
        optimisticData: [
            {
                onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
                key: ONYXKEYS_1.default.CORPAY_FIELDS,
                value: {
                    isLoading: true,
                    isSuccess: false,
                },
            },
        ],
        successData: [
            {
                onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
                key: ONYXKEYS_1.default.CORPAY_FIELDS,
                value: {
                    isLoading: false,
                    isSuccess: true,
                },
            },
        ],
        failureData: [
            {
                onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
                key: ONYXKEYS_1.default.CORPAY_FIELDS,
                value: {
                    isLoading: false,
                    isSuccess: false,
                },
            },
        ],
    };
    return API.read(types_1.READ_COMMANDS.GET_CORPAY_BANK_ACCOUNT_FIELDS, parameters, onyxData);
}
function createCorpayBankAccount(fields, policyID) {
    var parameters = {
        type: 1,
        isSavings: false,
        isWithdrawal: true,
        inputs: JSON.stringify(fields),
        policyID: policyID,
    };
    var onyxData = {
        optimisticData: [
            {
                onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
                key: ONYXKEYS_1.default.REIMBURSEMENT_ACCOUNT,
                value: {
                    isLoading: true,
                    isCreateCorpayBankAccount: true,
                },
            },
        ],
        successData: [
            {
                onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
                key: ONYXKEYS_1.default.REIMBURSEMENT_ACCOUNT,
                value: {
                    isLoading: false,
                    isCreateCorpayBankAccount: false,
                    errors: null,
                    isSuccess: true,
                },
            },
        ],
        failureData: [
            {
                onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
                key: ONYXKEYS_1.default.REIMBURSEMENT_ACCOUNT,
                value: {
                    isLoading: false,
                    isCreateCorpayBankAccount: false,
                    isSuccess: false,
                },
            },
        ],
    };
    return API.write(types_1.WRITE_COMMANDS.BANK_ACCOUNT_CREATE_CORPAY, parameters, onyxData);
}
function getCorpayOnboardingFields(country) {
    return API.read(types_1.READ_COMMANDS.GET_CORPAY_ONBOARDING_FIELDS, { countryISO: country });
}
function saveCorpayOnboardingCompanyDetails(parameters, bankAccountID) {
    var formattedParams = {
        inputs: JSON.stringify(parameters),
        bankAccountID: bankAccountID,
    };
    var onyxData = {
        optimisticData: [
            {
                onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
                key: ONYXKEYS_1.default.REIMBURSEMENT_ACCOUNT,
                value: {
                    isSavingCorpayOnboardingCompanyFields: true,
                    errors: null,
                },
            },
        ],
        successData: [
            {
                onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
                key: ONYXKEYS_1.default.REIMBURSEMENT_ACCOUNT,
                value: {
                    isSavingCorpayOnboardingCompanyFields: false,
                    isSuccess: true,
                },
            },
        ],
        failureData: [
            {
                onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
                key: ONYXKEYS_1.default.REIMBURSEMENT_ACCOUNT,
                value: {
                    isSavingCorpayOnboardingCompanyFields: false,
                    isSuccess: false,
                    errors: (0, ErrorUtils_1.getMicroSecondOnyxErrorWithTranslationKey)('common.genericErrorMessage'),
                },
            },
        ],
    };
    return API.write(types_1.WRITE_COMMANDS.SAVE_CORPAY_ONBOARDING_COMPANY_DETAILS, formattedParams, onyxData);
}
function saveCorpayOnboardingBeneficialOwners(parameters) {
    var onyxData = {
        optimisticData: [
            {
                onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
                key: ONYXKEYS_1.default.REIMBURSEMENT_ACCOUNT,
                value: {
                    isSavingCorpayOnboardingBeneficialOwnersFields: true,
                    errors: null,
                },
            },
        ],
        successData: [
            {
                onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
                key: ONYXKEYS_1.default.REIMBURSEMENT_ACCOUNT,
                value: {
                    isSavingCorpayOnboardingBeneficialOwnersFields: false,
                    isSuccess: true,
                },
            },
        ],
        failureData: [
            {
                onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
                key: ONYXKEYS_1.default.REIMBURSEMENT_ACCOUNT,
                value: {
                    isSavingCorpayOnboardingBeneficialOwnersFields: false,
                    isSuccess: false,
                    errors: (0, ErrorUtils_1.getMicroSecondOnyxErrorWithTranslationKey)('common.genericErrorMessage'),
                },
            },
        ],
    };
    return API.write(types_1.WRITE_COMMANDS.SAVE_CORPAY_ONBOARDING_BENEFICIAL_OWNER, parameters, onyxData);
}
function saveCorpayOnboardingDirectorInformation(parameters) {
    var onyxData = {
        optimisticData: [
            {
                onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
                key: ONYXKEYS_1.default.REIMBURSEMENT_ACCOUNT,
                value: {
                    isSavingCorpayOnboardingDirectorInformation: true,
                    errors: null,
                },
            },
        ],
        successData: [
            {
                onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
                key: ONYXKEYS_1.default.REIMBURSEMENT_ACCOUNT,
                value: {
                    isSavingCorpayOnboardingDirectorInformation: false,
                    isSuccess: true,
                },
            },
        ],
        failureData: [
            {
                onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
                key: ONYXKEYS_1.default.REIMBURSEMENT_ACCOUNT,
                value: {
                    isSavingCorpayOnboardingDirectorInformation: false,
                    isSuccess: false,
                    errors: (0, ErrorUtils_1.getMicroSecondOnyxErrorWithTranslationKey)('common.genericErrorMessage'),
                },
            },
        ],
    };
    return API.write(types_1.WRITE_COMMANDS.SAVE_CORPAY_ONBOARDING_DIRECTOR_INFORMATION, parameters, onyxData);
}
function finishCorpayBankAccountOnboarding(parameters) {
    var onyxData = {
        optimisticData: [
            {
                onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
                key: ONYXKEYS_1.default.REIMBURSEMENT_ACCOUNT,
                value: {
                    isFinishingCorpayBankAccountOnboarding: true,
                    errors: null,
                },
            },
        ],
        successData: [
            {
                onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
                key: ONYXKEYS_1.default.REIMBURSEMENT_ACCOUNT,
                value: {
                    isFinishingCorpayBankAccountOnboarding: false,
                    isSuccess: true,
                },
            },
        ],
        failureData: [
            {
                onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
                key: ONYXKEYS_1.default.REIMBURSEMENT_ACCOUNT,
                value: {
                    isFinishingCorpayBankAccountOnboarding: false,
                    isSuccess: false,
                    errors: (0, ErrorUtils_1.getMicroSecondOnyxErrorWithTranslationKey)('common.genericErrorMessage'),
                },
            },
        ],
    };
    return API.write(types_1.WRITE_COMMANDS.FINISH_CORPAY_BANK_ACCOUNT_ONBOARDING, parameters, onyxData);
}
function clearCorpayBankAccountFields() {
    react_native_onyx_1.default.set(ONYXKEYS_1.default.CORPAY_FIELDS, null);
}
function clearReimbursementAccountBankCreation() {
    react_native_onyx_1.default.merge(ONYXKEYS_1.default.REIMBURSEMENT_ACCOUNT, { isCreateCorpayBankAccount: null, isSuccess: null, isLoading: null });
}
function clearReimbursementAccountSaveCorpayOnboardingCompanyDetails() {
    react_native_onyx_1.default.merge(ONYXKEYS_1.default.REIMBURSEMENT_ACCOUNT, { isSuccess: null, isSavingCorpayOnboardingCompanyFields: null });
}
function clearReimbursementAccountSaveCorpayOnboardingBeneficialOwners() {
    react_native_onyx_1.default.merge(ONYXKEYS_1.default.REIMBURSEMENT_ACCOUNT, { isSuccess: null, isSavingCorpayOnboardingBeneficialOwnersFields: null });
}
function clearReimbursementAccountSaveCorpayOnboardingDirectorInformation() {
    react_native_onyx_1.default.merge(ONYXKEYS_1.default.REIMBURSEMENT_ACCOUNT, { isSuccess: null, isSavingCorpayOnboardingDirectorInformation: null });
}
function clearReimbursementAccountFinishCorpayBankAccountOnboarding() {
    react_native_onyx_1.default.merge(ONYXKEYS_1.default.REIMBURSEMENT_ACCOUNT, { isSuccess: null, isFinishingCorpayBankAccountOnboarding: null });
}
/**
 * Function to display and fetch data for Reimbursement Account step
 * @param stepToOpen - current step to open
 * @param subStep - particular step
 * @param localCurrentStep - last step on device
 * @param policyID - policy ID
 */
function openReimbursementAccountPage(stepToOpen, subStep, localCurrentStep, policyID) {
    var onyxData = {
        optimisticData: [
            {
                onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
                key: ONYXKEYS_1.default.REIMBURSEMENT_ACCOUNT,
                value: {
                    isLoading: true,
                },
            },
        ],
        successData: [
            {
                onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
                key: ONYXKEYS_1.default.REIMBURSEMENT_ACCOUNT,
                value: {
                    isLoading: false,
                },
            },
        ],
        failureData: [
            {
                onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
                key: ONYXKEYS_1.default.REIMBURSEMENT_ACCOUNT,
                value: {
                    isLoading: false,
                },
            },
        ],
    };
    var parameters = {
        stepToOpen: stepToOpen,
        subStep: subStep,
        localCurrentStep: localCurrentStep,
        policyID: policyID,
    };
    return API.read(types_1.READ_COMMANDS.OPEN_REIMBURSEMENT_ACCOUNT_PAGE, parameters, onyxData);
}
/**
 * Updates the bank account in the database with the company step data
 * @param params - Business step form data
 * @param policyID - ID of the policy we're setting the bank account on
 * @param isConfirmPage - If we're submitting from the confirmation substep, to trigger all external checks
 */
function updateCompanyInformationForBankAccount(bankAccountID, params, policyID, isConfirmPage) {
    API.write(types_1.WRITE_COMMANDS.UPDATE_COMPANY_INFORMATION_FOR_BANK_ACCOUNT, __assign(__assign({}, params), { bankAccountID: bankAccountID, policyID: policyID, confirm: isConfirmPage }), getVBBADataForOnyx(CONST_1.default.BANK_ACCOUNT.STEP.COMPANY, isConfirmPage));
}
/**
 * Add beneficial owners for the bank account and verify the accuracy of the information provided
 * @param params - Beneficial Owners step form params
 */
function updateBeneficialOwnersForBankAccount(bankAccountID, params, policyID) {
    API.write(types_1.WRITE_COMMANDS.UPDATE_BENEFICIAL_OWNERS_FOR_BANK_ACCOUNT, __assign(__assign({}, params), { bankAccountID: bankAccountID, policyID: policyID }), getVBBADataForOnyx());
}
/**
 * Accept the ACH terms and conditions and verify the accuracy of the information provided
 * @param params - Verification step form params
 */
function acceptACHContractForBankAccount(bankAccountID, params, policyID) {
    API.write(types_1.WRITE_COMMANDS.ACCEPT_ACH_CONTRACT_FOR_BANK_ACCOUNT, __assign(__assign({}, params), { bankAccountID: bankAccountID, policyID: policyID }), getVBBADataForOnyx());
}
/**
 * Create the bank account with manually entered data.
 */
function connectBankAccountManually(bankAccountID, bankAccount, policyID) {
    var parameters = {
        bankAccountID: bankAccountID,
        routingNumber: bankAccount.routingNumber,
        accountNumber: bankAccount.accountNumber,
        bank: bankAccount.bankName,
        plaidAccountID: bankAccount.plaidAccountID,
        plaidAccessToken: bankAccount.plaidAccessToken,
        plaidMask: bankAccount.mask,
        isSavings: bankAccount.isSavings,
        policyID: policyID,
    };
    API.write(types_1.WRITE_COMMANDS.CONNECT_BANK_ACCOUNT_MANUALLY, parameters, getVBBADataForOnyx(CONST_1.default.BANK_ACCOUNT.STEP.BANK_ACCOUNT));
}
/**
 * Verify the user's identity via Onfido
 */
function verifyIdentityForBankAccount(bankAccountID, onfidoData, policyID) {
    var parameters = {
        bankAccountID: bankAccountID,
        onfidoData: JSON.stringify(onfidoData),
        policyID: policyID,
    };
    API.write(types_1.WRITE_COMMANDS.VERIFY_IDENTITY_FOR_BANK_ACCOUNT, parameters, getVBBADataForOnyx());
}
function openWorkspaceView(policyID) {
    API.read(types_1.READ_COMMANDS.OPEN_WORKSPACE_VIEW, {
        policyID: policyID,
    }, {
        optimisticData: [
            {
                onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
                key: ONYXKEYS_1.default.REIMBURSEMENT_ACCOUNT,
                value: {
                    isLoading: true,
                },
            },
        ],
        successData: [
            {
                onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
                key: ONYXKEYS_1.default.REIMBURSEMENT_ACCOUNT,
                value: {
                    isLoading: false,
                },
            },
        ],
        failureData: [
            {
                onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
                key: ONYXKEYS_1.default.REIMBURSEMENT_ACCOUNT,
                value: {
                    isLoading: false,
                },
            },
        ],
    });
}
function handlePlaidError(bankAccountID, error, errorDescription, plaidRequestID) {
    var parameters = {
        bankAccountID: bankAccountID,
        error: error,
        errorDescription: errorDescription,
        plaidRequestID: plaidRequestID,
    };
    API.write(types_1.WRITE_COMMANDS.BANK_ACCOUNT_HANDLE_PLAID_ERROR, parameters);
}
/**
 * Set the reimbursement account loading so that it happens right away, instead of when the API command is processed.
 */
function setReimbursementAccountLoading(isLoading) {
    react_native_onyx_1.default.merge(ONYXKEYS_1.default.REIMBURSEMENT_ACCOUNT, { isLoading: isLoading });
}
function validatePlaidSelection(values) {
    var errorFields = {};
    if (!values.selectedPlaidAccountID) {
        errorFields.selectedPlaidAccountID = (0, Localize_1.translateLocal)('bankAccount.error.youNeedToSelectAnOption');
    }
    return errorFields;
}
function fetchCorpayFields(bankCountry, bankCurrency, isWithdrawal, isBusinessBankAccount) {
    API.write(types_1.WRITE_COMMANDS.GET_CORPAY_BANK_ACCOUNT_FIELDS, { countryISO: bankCountry, currency: bankCurrency, isWithdrawal: isWithdrawal, isBusinessBankAccount: isBusinessBankAccount }, {
        optimisticData: [
            {
                onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
                key: ONYXKEYS_1.default.PERSONAL_BANK_ACCOUNT,
                value: {
                    isLoading: true,
                },
            },
            {
                onyxMethod: react_native_onyx_1.default.METHOD.SET,
                key: ONYXKEYS_1.default.FORMS.INTERNATIONAL_BANK_ACCOUNT_FORM_DRAFT,
                value: {
                    bankCountry: bankCountry,
                    bankCurrency: bankCurrency !== null && bankCurrency !== void 0 ? bankCurrency : null,
                },
            },
        ],
        finallyData: [
            {
                onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
                key: ONYXKEYS_1.default.PERSONAL_BANK_ACCOUNT,
                value: {
                    isLoading: false,
                },
            },
        ],
    });
}
function createCorpayBankAccountForWalletFlow(data, classification, destinationCountry, preferredMethod) {
    var inputData = __assign(__assign({}, data), { classification: classification, destinationCountry: destinationCountry, preferredMethod: preferredMethod, setupType: 'manual', fieldsType: 'international', country: data.bankCountry, currency: data.bankCurrency });
    // eslint-disable-next-line rulesdir/no-api-side-effects-method
    return API.makeRequestWithSideEffects(types_1.SIDE_EFFECT_REQUEST_COMMANDS.BANK_ACCOUNT_CREATE_CORPAY, { isWithdrawal: false, isSavings: true, inputs: JSON.stringify(inputData) });
}
