import {openDepositAccountSetup} from '@userActions/BankAccounts';

import ONYXKEYS from '@src/ONYXKEYS';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';

import {useRoute} from '@react-navigation/native';
import {useEffect, useEffectEvent, useState} from 'react';

import useOnyx from './useOnyx';

/**
 * Fetches the reimbursement countries the collect deposit account flow needs and reports whether that is in flight.
 * Each page of the flow is its own navigation, so this only fires on the first page or when landing mid-flow.
 */
function useLoadDepositAccountSetup(): boolean {
    const route = useRoute();
    const [isFlowEntryMount] = useState(() => !(route.params as {subPage?: string} | undefined)?.subPage);
    const [isLoadingDepositAccountSetup, metadata] = useOnyx(ONYXKEYS.RAM_ONLY_IS_LOADING_DEPOSIT_ACCOUNT_SETUP);
    const isReadingFlagFromOnyx = isLoadingOnyxValue(metadata);

    const loadDepositAccountSetup = useEffectEvent(() => {
        if (!isFlowEntryMount && isLoadingDepositAccountSetup !== undefined) {
            return;
        }
        openDepositAccountSetup();
    });

    useEffect(() => {
        if (isReadingFlagFromOnyx) {
            return;
        }
        loadDepositAccountSetup();
    }, [isReadingFlagFromOnyx]);

    return isLoadingDepositAccountSetup ?? true;
}

export default useLoadDepositAccountSetup;
