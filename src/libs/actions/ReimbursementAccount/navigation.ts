import Onyx from 'react-native-onyx';
import type {LinkToOptions} from '@libs/Navigation/helpers/linkTo/types';
import Navigation from '@libs/Navigation/Navigation';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {BankAccountStep} from '@src/types/onyx/ReimbursementAccount';

/**
 * Navigate to a specific step in the VBA flow
 */
function goToWithdrawalAccountSetupStep(stepID: BankAccountStep) {
    Onyx.merge(ONYXKEYS.REIMBURSEMENT_ACCOUNT, {achData: {currentStep: stepID}});
}

/**
 * Navigate to the correct bank account route based on the bank account state and type
 *
 * @param policyID - The policy ID associated with the bank account.
 * @param [backTo] - An optional return path. If provided, it will be URL-encoded and appended to the resulting URL.
 */
function navigateToBankAccountRoute(policyID: string | undefined, backTo?: string, navigationOptions?: LinkToOptions) {
    Navigation.navigate(ROUTES.BANK_ACCOUNT_WITH_STEP_TO_OPEN.getRoute({policyID, backTo}), navigationOptions);
}

export {goToWithdrawalAccountSetupStep, navigateToBankAccountRoute};
