import {getCardSettings, getEligibleBankAccountsForCard} from '@libs/CardUtils';
import Navigation from '@libs/Navigation/Navigation';
import {hasInProgressUSDVBBA} from '@libs/ReimbursementAccountUtils';
import {getTravelBillingCardSettingsKey, getTravelSettlementAccount, hasTravelBillingSettlementAccount} from '@libs/TravelBillingUtils';

import {configureTravelBillingForPolicy} from '@userActions/TravelBilling';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';

import useOnyx from './useOnyx';
import useWorkspaceAccountID from './useWorkspaceAccountID';

/**
 * Returns a handler that starts setting up a brand-new Travel Billing feed on the policy's own workspace fund:
 * add a bank account if needed, then the settlement account. Uses the workspace fund so a joined shared feed is never touched.
 */
function useTravelBillingSetupFlow(policyID: string | undefined) {
    const workspaceAccountID = useWorkspaceAccountID(policyID);
    const [cardSettings] = useOnyx(getTravelBillingCardSettingsKey(workspaceAccountID));
    const [bankAccountList] = useOnyx(ONYXKEYS.BANK_ACCOUNT_LIST);
    const [reimbursementAccount] = useOnyx(ONYXKEYS.REIMBURSEMENT_ACCOUNT);

    const travelSettings = getCardSettings(cardSettings, CONST.TRAVEL.PROGRAM_TRAVEL_US);
    const eligibleBankAccounts = getEligibleBankAccountsForCard(bankAccountList);
    const isSetupUnfinished = hasInProgressUSDVBBA(reimbursementAccount?.achData);
    const hasSettlementAccount = hasTravelBillingSettlementAccount(travelSettings);
    const settlementAccount = getTravelSettlementAccount(travelSettings, bankAccountList);

    return () => {
        if (!policyID) {
            return;
        }
        if (!eligibleBankAccounts.length || isSetupUnfinished) {
            Navigation.navigate(ROUTES.BANK_ACCOUNT_WITH_STEP_TO_OPEN.getRoute({policyID, backTo: ROUTES.WORKSPACE_TRAVEL.getRoute(policyID)}));
            return;
        }
        if (!hasSettlementAccount) {
            Navigation.navigate(ROUTES.WORKSPACE_TRAVEL_SETTINGS_ACCOUNT.getRoute(policyID));
            return;
        }
        if (settlementAccount?.bankAccountID) {
            configureTravelBillingForPolicy(policyID, workspaceAccountID, settlementAccount.bankAccountID);
        }
        Navigation.navigate(ROUTES.WORKSPACE_TRAVEL_SETTINGS_ACCOUNT.getRoute(policyID));
    };
}

export default useTravelBillingSetupFlow;
