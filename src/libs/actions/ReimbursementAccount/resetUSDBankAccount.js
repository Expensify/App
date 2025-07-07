"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_native_onyx_1 = require("react-native-onyx");
var API = require("@libs/API");
var types_1 = require("@libs/API/types");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var ReimbursementAccountForm_1 = require("@src/types/form/ReimbursementAccountForm");
var allPolicies;
react_native_onyx_1.default.connect({
    key: ONYXKEYS_1.default.COLLECTION.POLICY,
    waitForCollectionCallback: true,
    callback: function (value) { return (allPolicies = value); },
});
/**
 * Reset user's USD reimbursement account. This will delete the bank account
 */
function resetUSDBankAccount(bankAccountID, session, policyID) {
    var _a;
    var _b;
    if (!bankAccountID) {
        throw new Error('Missing bankAccountID when attempting to reset free plan bank account');
    }
    if (!(session === null || session === void 0 ? void 0 : session.email)) {
        throw new Error('Missing credentials when attempting to reset free plan bank account');
    }
    var policy = (_b = allPolicies === null || allPolicies === void 0 ? void 0 : allPolicies["".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID)]) !== null && _b !== void 0 ? _b : {};
    API.write(types_1.WRITE_COMMANDS.RESTART_BANK_ACCOUNT_SETUP, {
        bankAccountID: bankAccountID,
        ownerEmail: session.email,
        policyID: policyID,
    }, {
        optimisticData: [
            {
                onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
                key: ONYXKEYS_1.default.REIMBURSEMENT_ACCOUNT,
                value: {
                    shouldShowResetModal: false,
                    isLoading: true,
                    pendingAction: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.DELETE,
                    achData: null,
                },
            },
            {
                onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
                key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID),
                value: {
                    achAccount: null,
                },
            },
        ],
        successData: [
            {
                onyxMethod: react_native_onyx_1.default.METHOD.SET,
                key: ONYXKEYS_1.default.ONFIDO_TOKEN,
                value: '',
            },
            {
                onyxMethod: react_native_onyx_1.default.METHOD.SET,
                key: ONYXKEYS_1.default.ONFIDO_APPLICANT_ID,
                value: '',
            },
            {
                onyxMethod: react_native_onyx_1.default.METHOD.SET,
                key: ONYXKEYS_1.default.PLAID_DATA,
                value: CONST_1.default.PLAID.DEFAULT_DATA,
            },
            {
                onyxMethod: react_native_onyx_1.default.METHOD.SET,
                key: ONYXKEYS_1.default.PLAID_LINK_TOKEN,
                value: '',
            },
            {
                onyxMethod: react_native_onyx_1.default.METHOD.SET,
                key: ONYXKEYS_1.default.REIMBURSEMENT_ACCOUNT,
                value: CONST_1.default.REIMBURSEMENT_ACCOUNT.DEFAULT_DATA,
            },
            {
                onyxMethod: react_native_onyx_1.default.METHOD.SET,
                key: ONYXKEYS_1.default.FORMS.REIMBURSEMENT_ACCOUNT_FORM_DRAFT,
                value: (_a = {},
                    _a[ReimbursementAccountForm_1.default.BENEFICIAL_OWNER_INFO_STEP.OWNS_MORE_THAN_25_PERCENT] = false,
                    _a[ReimbursementAccountForm_1.default.BENEFICIAL_OWNER_INFO_STEP.HAS_OTHER_BENEFICIAL_OWNERS] = false,
                    _a[ReimbursementAccountForm_1.default.BENEFICIAL_OWNER_INFO_STEP.BENEFICIAL_OWNERS] = '',
                    _a[ReimbursementAccountForm_1.default.BANK_INFO_STEP.ACCOUNT_NUMBER] = '',
                    _a[ReimbursementAccountForm_1.default.BANK_INFO_STEP.ROUTING_NUMBER] = '',
                    _a[ReimbursementAccountForm_1.default.BANK_INFO_STEP.PLAID_ACCOUNT_ID] = '',
                    _a[ReimbursementAccountForm_1.default.BANK_INFO_STEP.PLAID_MASK] = '',
                    _a[ReimbursementAccountForm_1.default.BUSINESS_INFO_STEP.COMPANY_NAME] = '',
                    _a[ReimbursementAccountForm_1.default.BUSINESS_INFO_STEP.STREET] = '',
                    _a[ReimbursementAccountForm_1.default.BUSINESS_INFO_STEP.CITY] = '',
                    _a[ReimbursementAccountForm_1.default.BUSINESS_INFO_STEP.STATE] = '',
                    _a[ReimbursementAccountForm_1.default.BUSINESS_INFO_STEP.ZIP_CODE] = '',
                    _a[ReimbursementAccountForm_1.default.BUSINESS_INFO_STEP.COMPANY_PHONE] = '',
                    _a[ReimbursementAccountForm_1.default.BUSINESS_INFO_STEP.COMPANY_WEBSITE] = undefined,
                    _a[ReimbursementAccountForm_1.default.BUSINESS_INFO_STEP.COMPANY_TAX_ID] = '',
                    _a[ReimbursementAccountForm_1.default.BUSINESS_INFO_STEP.INCORPORATION_TYPE] = '',
                    _a[ReimbursementAccountForm_1.default.BUSINESS_INFO_STEP.INCORPORATION_DATE] = '',
                    _a[ReimbursementAccountForm_1.default.BUSINESS_INFO_STEP.INCORPORATION_STATE] = '',
                    _a[ReimbursementAccountForm_1.default.BUSINESS_INFO_STEP.HAS_NO_CONNECTION_TO_CANNABIS] = false,
                    _a[ReimbursementAccountForm_1.default.PERSONAL_INFO_STEP.FIRST_NAME] = '',
                    _a[ReimbursementAccountForm_1.default.PERSONAL_INFO_STEP.LAST_NAME] = '',
                    _a[ReimbursementAccountForm_1.default.PERSONAL_INFO_STEP.STREET] = '',
                    _a[ReimbursementAccountForm_1.default.PERSONAL_INFO_STEP.CITY] = '',
                    _a[ReimbursementAccountForm_1.default.PERSONAL_INFO_STEP.STATE] = '',
                    _a[ReimbursementAccountForm_1.default.PERSONAL_INFO_STEP.ZIP_CODE] = '',
                    _a[ReimbursementAccountForm_1.default.PERSONAL_INFO_STEP.IS_ONFIDO_SETUP_COMPLETE] = false,
                    _a[ReimbursementAccountForm_1.default.PERSONAL_INFO_STEP.DOB] = '',
                    _a[ReimbursementAccountForm_1.default.PERSONAL_INFO_STEP.SSN_LAST_4] = '',
                    _a[ReimbursementAccountForm_1.default.COMPLETE_VERIFICATION.ACCEPT_TERMS_AND_CONDITIONS] = false,
                    _a[ReimbursementAccountForm_1.default.COMPLETE_VERIFICATION.CERTIFY_TRUE_INFORMATION] = false,
                    _a[ReimbursementAccountForm_1.default.COMPLETE_VERIFICATION.IS_AUTHORIZED_TO_USE_BANK_ACCOUNT] = false,
                    _a[ReimbursementAccountForm_1.default.BANK_INFO_STEP.IS_SAVINGS] = false,
                    _a[ReimbursementAccountForm_1.default.BANK_INFO_STEP.BANK_NAME] = '',
                    _a[ReimbursementAccountForm_1.default.BANK_INFO_STEP.PLAID_ACCESS_TOKEN] = '',
                    _a[ReimbursementAccountForm_1.default.BANK_INFO_STEP.SELECTED_PLAID_ACCOUNT_ID] = '',
                    _a[ReimbursementAccountForm_1.default.AMOUNT1] = '',
                    _a[ReimbursementAccountForm_1.default.AMOUNT2] = '',
                    _a[ReimbursementAccountForm_1.default.AMOUNT3] = '',
                    _a),
            },
        ],
        failureData: [
            {
                onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
                key: ONYXKEYS_1.default.REIMBURSEMENT_ACCOUNT,
                value: { isLoading: false, pendingAction: null },
            },
            {
                onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
                key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID),
                value: {
                    achAccount: policy === null || policy === void 0 ? void 0 : policy.achAccount,
                },
            },
        ],
    });
}
exports.default = resetUSDBankAccount;
