import {getEligibleExistingBusinessBankAccounts} from '@libs/WorkflowUtils';

import Navigation from '@navigation/Navigation';

import {navigateToBankAccountRoute, prepareNewBankAccountSetup} from '@userActions/ReimbursementAccount';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';

import useOnyx from './useOnyx';

/**
 * Returns a handler that changes the workspace's verified business bank account. When there are other eligible
 * business bank accounts to connect it opens the existing-account picker, otherwise it starts a fresh setup.
 * Shared by ConnectedVerifiedBankAccount and VerifiedBankAccountFlowEntryPoint.
 */
function useChangeBankAccount(policyID: string | undefined, currency: string | undefined, bankAccountID: number | undefined) {
    const [hasOtherEligibleAccountsToConnect = false] = useOnyx(ONYXKEYS.BANK_ACCOUNT_LIST, {
        selector: (bankAccountList) => getEligibleExistingBusinessBankAccounts(bankAccountList, currency, true, bankAccountID).length > 0,
    });

    return () => {
        if (!policyID || !currency) {
            return;
        }

        if (hasOtherEligibleAccountsToConnect) {
            Navigation.navigate(ROUTES.BANK_ACCOUNT_CONNECT_EXISTING_BUSINESS_BANK_ACCOUNT.getRoute(policyID, undefined, CONST.BANK_ACCOUNT.CONNECT_EXISTING_SOURCE.CHANGE_BANK_ACCOUNT));
            return;
        }

        prepareNewBankAccountSetup(currency);
        navigateToBankAccountRoute({policyID});
    };
}

export default useChangeBankAccount;
