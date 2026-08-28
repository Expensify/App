import {openDepositAccountSetup} from '@userActions/BankAccounts';

import ONYXKEYS from '@src/ONYXKEYS';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';

import {useRoute} from '@react-navigation/native';
import {useEffect, useEffectEvent, useState} from 'react';

import useOnyx from './useOnyx';

/**
 * Fetches the reimbursement countries for the user's policies (OpenDepositAccountSetup) and reports whether that
 * fetch is in flight.
 *
 * useShouldCollectInternationalDepositDetails decides whether to collect international deposit details from this data,
 * and that decision determines which steps the flow shows, so callers must gate rendering on the returned flag.
 *
 * Each page of the flow is a separate navigation (a fresh mount of the screen, not an in-place update), so the request
 * can't simply be tied to the mount or it would fire on every next/back. Instead it fires when either:
 * - this is the flow-entry mount (no subPage in the URL yet), so every new visit to the flow gets fresh countries, or
 * - the loading flag is still undefined, which covers landing mid-flow via a deeplink or a reload.
 *
 * The flag is RAM-only, so a reload starts from undefined and fetches again. It is set to `true` optimistically while
 * the request is in flight and `false` once it settles.
 */
function useLoadDepositAccountSetup(): boolean {
    const route = useRoute();
    // Frozen at the first render: useSubPage redirects the entry mount by setting the subPage param, which would
    // otherwise flip this to false part-way through the same mount.
    const [isFlowEntryMount] = useState(() => !(route.params as {subPage?: string} | undefined)?.subPage);
    const [isLoadingDepositAccountSetup, metadata] = useOnyx(ONYXKEYS.RAM_ONLY_IS_LOADING_DEPOSIT_ACCOUNT_SETUP);
    const isReadingFlagFromOnyx = isLoadingOnyxValue(metadata);

    // Reading the flag through an effect event keeps it out of the effect's dependencies, so the request the flag
    // itself triggers can't feed back and re-run the effect.
    const loadDepositAccountSetup = useEffectEvent(() => {
        if (!isFlowEntryMount && isLoadingDepositAccountSetup !== undefined) {
            return;
        }
        openDepositAccountSetup();
    });

    useEffect(() => {
        // Until Onyx has read the key, an undefined flag only means "not read yet" - deciding now would fire a
        // duplicate request on every mid-flow mount.
        if (isReadingFlagFromOnyx) {
            return;
        }
        loadDepositAccountSetup();
    }, [isReadingFlagFromOnyx]);

    return isLoadingDepositAccountSetup ?? true;
}

export default useLoadDepositAccountSetup;
