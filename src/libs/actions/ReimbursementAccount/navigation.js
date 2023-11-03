import Onyx from 'react-native-onyx';
import Navigation from '@libs/Navigation/Navigation';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';

/**
 * Navigate to a specific step in the VBA flow
 *
 * @param {String} stepID
 * @param {Object} newAchData
 */
function goToWithdrawalAccountSetupStep(stepID, newAchData) {
    Onyx.merge(ONYXKEYS.REIMBURSEMENT_ACCOUNT, {achData: {...newAchData, currentStep: stepID}});
}

/**
 * Navigate to the correct bank account route based on the bank account state and type
 *
 * @param {string} policyId - The policy ID associated with the bank account.
 * @param {string} [backTo=''] - An optional return path. If provided, it will be URL-encoded and appended to the resulting URL.
 */
function navigateToBankAccountRoute(policyId, backTo) {
    Navigation.navigate(ROUTES.BANK_ACCOUNT_WITH_STEP_TO_OPEN.getRoute('', policyId, backTo));
}

export {goToWithdrawalAccountSetupStep, navigateToBankAccountRoute};
