import Onyx from 'react-native-onyx';
import type {LinkToOptions} from '@libs/Navigation/helpers/linkTo/types';
import Navigation from '@libs/Navigation/Navigation';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {ACHData, BankAccountStep} from '@src/types/onyx/ReimbursementAccount';

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
 * @param [policyCurrency] - The output currency of the policy. Used to detect a USD VBA that needs validation.
 * @param [backTo] - An optional return path. If provided, it will be URL-encoded and appended to the resulting URL.
 * @param [bankAccountID] - An optional bank account ID. There can be bank accounts that are not linked to any workspace.
 * @param [achDataState] - The current state of the bank account. Used to detect a pending USD VBA that needs validation.
 * @param [navigationOptions] - Optional navigation options to customize the navigation behavior.
 */
function navigateToBankAccountRoute({
    policyID = '',
    policyCurrency,
    bankAccountID,
    achDataState,
    backTo,
    navigationOptions,
}: {
    policyID?: string;
    policyCurrency?: string;
    bankAccountID?: number;
    achDataState?: ACHData['state'];
    backTo?: string;
    navigationOptions?: LinkToOptions;
}) {
    // A USD bank account in the pending state needs micro-deposit validation, so send the user straight to the validation
    // step instead of the entry point. Navigating here (rather than from ReimbursementAccountPage's effect) avoids the page
    // mounting and immediately navigating away, which on small screens unmounts the page and resets achData.
    if (policyCurrency === CONST.CURRENCY.USD && achDataState === CONST.BANK_ACCOUNT.STATE.PENDING) {
        Navigation.navigate(ROUTES.BANK_ACCOUNT_USD_SETUP.getRoute({policyID, page: CONST.BANK_ACCOUNT.PAGE_NAMES.VALIDATION, backTo}));
        return;
    }
    Navigation.navigate(ROUTES.BANK_ACCOUNT_WITH_STEP_TO_OPEN.getRoute({policyID, bankAccountID, backTo}), navigationOptions);
}

export {goToWithdrawalAccountSetupStep, navigateToBankAccountRoute};
