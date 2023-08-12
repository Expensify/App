import Onyx from 'react-native-onyx';
import ONYXKEYS from '../../../ONYXKEYS';
import ROUTES from '../../../ROUTES';
import Navigation from '../../Navigation/Navigation';

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
 * @param {String} policyId
 * @param {String} backTo
 */
function navigateToBankAccountRoute(policyId, backTo) {
    Navigation.navigate(ROUTES.getBankAccountRoute('', policyId, backTo));
}

export {goToWithdrawalAccountSetupStep, navigateToBankAccountRoute};
