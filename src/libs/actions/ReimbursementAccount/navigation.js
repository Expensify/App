"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.goToWithdrawalAccountSetupStep = goToWithdrawalAccountSetupStep;
exports.navigateToBankAccountRoute = navigateToBankAccountRoute;
var react_native_onyx_1 = require("react-native-onyx");
var Navigation_1 = require("@libs/Navigation/Navigation");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var ROUTES_1 = require("@src/ROUTES");
/**
 * Navigate to a specific step in the VBA flow
 */
function goToWithdrawalAccountSetupStep(stepID) {
    react_native_onyx_1.default.merge(ONYXKEYS_1.default.REIMBURSEMENT_ACCOUNT, { achData: { currentStep: stepID } });
}
/**
 * Navigate to the correct bank account route based on the bank account state and type
 *
 * @param policyID - The policy ID associated with the bank account.
 * @param [backTo] - An optional return path. If provided, it will be URL-encoded and appended to the resulting URL.
 */
function navigateToBankAccountRoute(policyID, backTo, navigationOptions) {
    Navigation_1.default.navigate(ROUTES_1.default.BANK_ACCOUNT_WITH_STEP_TO_OPEN.getRoute(policyID, '', backTo), navigationOptions);
}
