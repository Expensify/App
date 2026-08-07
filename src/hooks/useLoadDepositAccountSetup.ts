import {openDepositAccountSetup} from '@userActions/BankAccounts';

import ONYXKEYS from '@src/ONYXKEYS';

import {useEffect} from 'react';

import useOnyx from './useOnyx';

/**
 * Fetches the reimbursement countries for the user's policies (OpenDepositAccountSetup) when the personal bank
 * account setup flow is opened and reports whether that fetch is in flight.
 *
 * useShouldCollectInternationalDepositDetails decides whether to collect international deposit details from this data,
 * and that decision determines which steps the flow shows and where it starts. Because the substep hooks capture their
 * starting position on the first render, callers must gate the flow on this loading state so the decision is made with
 * the reimbursement data present rather than a stale/empty value.
 */
function useLoadDepositAccountSetup(): boolean {
    useEffect(() => {
        openDepositAccountSetup();
    }, []);

    const [isLoadingDepositAccountSetup = true] = useOnyx(ONYXKEYS.IS_LOADING_DEPOSIT_ACCOUNT_SETUP);
    return isLoadingDepositAccountSetup;
}

export default useLoadDepositAccountSetup;
