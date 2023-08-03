import Onyx from 'react-native-onyx';
import ONYXKEYS from '../../../ONYXKEYS';
import ROUTES from '../../../ROUTES';
import Navigation from '../../Navigation/Navigation';

/**
 * Navigate to a specific step in the VBA flow
 *
 * @param {String} policyID
 * @param {String} stepID
 * @param {Object} newAchData
 */
function goToWithdrawalAccountSetupStep(policyID, stepID, newAchData) {
    Onyx.merge(`${ONYXKEYS.COLLECTION.REIMBURSEMENT_ACCOUNT}${policyID}`, {achData: {...newAchData, currentStep: stepID}});
}

/**
 * Navigate to the correct bank account route based on the bank account state and type
 *
 * @param {String} policyID
 */
function navigateToBankAccountRoute(policyID) {
    Navigation.navigate(ROUTES.getBankAccountRoute('', policyID));
}

export {goToWithdrawalAccountSetupStep, navigateToBankAccountRoute};
