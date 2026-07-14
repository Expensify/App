import type {LinkToOptions} from '@libs/Navigation/helpers/linkTo/types';
import Navigation from '@libs/Navigation/Navigation';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {BankAccountStep} from '@src/types/onyx/ReimbursementAccount';

import Onyx from 'react-native-onyx';

/**
 * Navigate to a specific step in the VBA flow
 */
function goToWithdrawalAccountSetupStep(stepID: BankAccountStep) {
    Onyx.merge(ONYXKEYS.REIMBURSEMENT_ACCOUNT, {achData: {currentStep: stepID}});
}

/**
 * Navigate to the correct bank account route based on the bank account state and type
 *
 * @param [policyID] - The policy ID associated with the bank account.
 * @param [backTo] - An optional return path. If provided, it will be URL-encoded and appended to the resulting URL.
 * @param [bankAccountID] - An optional bank account ID. There can be bank accounts that are not linked to any workspace.
 * @param [navigationOptions] - Optional navigation options to customize the navigation behavior.
 * @param [policyCurrency] - The policy output currency. Used to detect a USD account that should skip straight to validation.
 * @param [bankAccountState] - The current bank account state. Used to detect a pending account that should skip straight to validation.
 */
function navigateToBankAccountRoute({
    policyID = '',
    bankAccountID,
    backTo,
    navigationOptions,
    policyCurrency,
    bankAccountState,
}: {
    policyID?: string;
    bankAccountID?: number;
    backTo?: string;
    navigationOptions?: LinkToOptions;
    policyCurrency?: string;
    bankAccountState?: string;
}) {
    // If USD bank account is in pending state, we should navigate straight to the validation step and skip the Continue setup step
    if (policyCurrency === CONST.CURRENCY.USD && bankAccountState === CONST.BANK_ACCOUNT.STATE.PENDING) {
        Navigation.navigate(ROUTES.BANK_ACCOUNT_USD_SETUP.getRoute({policyID, page: CONST.BANK_ACCOUNT.PAGE_NAMES.VALIDATION, backTo}), navigationOptions);
        return;
    }

    Navigation.navigate(ROUTES.BANK_ACCOUNT_WITH_STEP_TO_OPEN.getRoute({policyID, bankAccountID, backTo}), navigationOptions);
}

export {goToWithdrawalAccountSetupStep, navigateToBankAccountRoute};
