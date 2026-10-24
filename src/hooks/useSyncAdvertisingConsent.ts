import {updateAdvertisingConsent} from '@libs/actions/User';
import {getTargetedAdvertisingConsent, subscribeToTargetedAdvertisingConsent} from '@libs/Ketch';

import ONYXKEYS from '@src/ONYXKEYS';
import {hasNonAnonymousSessionSelector, isDelegateSessionSelector, isSupportalSessionSelector} from '@src/selectors/Session';
import type {Session} from '@src/types/onyx';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';

import type {OnyxEntry} from 'react-native-onyx';

import {useEffect, useState} from 'react';

import useOnyx from './useOnyx';

/**
 * Whether the consent read in this browser belongs to the signed in account. Support agents (supportal) and copilots
 * (delegates) act on someone else's account, so their browser's consent must not be saved on it.
 */
const canSendConsentSelector = (session: OnyxEntry<Session>) => hasNonAnonymousSessionSelector(session) && !isSupportalSessionSelector(session) && !isDelegateSessionSelector(session);

/**
 * Sends the user's Ketch targeted advertising consent to the server when it changes while signed in to their own account, and once after
 * sign in when it differs from the last value sent (that value is cleared on sign out). Used in Expensify.tsx, so it
 * also starts reading the consent from Ketch at boot, before a signup needs it. Ketch is web only, so this is a no-op on native.
 */
function useSyncAdvertisingConsent() {
    const [targetedAdvertisingConsent, setTargetedAdvertisingConsent] = useState(getTargetedAdvertisingConsent);
    const [canSendConsent] = useOnyx(ONYXKEYS.SESSION, {
        selector: canSendConsentSelector,
    });
    const [lastSentConsent, lastSentConsentMetadata] = useOnyx(ONYXKEYS.LAST_SENT_TARGETED_ADVERTISING_CONSENT);
    const isLastSentConsentLoading = isLoadingOnyxValue(lastSentConsentMetadata);

    useEffect(() => subscribeToTargetedAdvertisingConsent(setTargetedAdvertisingConsent), []);

    useEffect(() => {
        if (!targetedAdvertisingConsent || !canSendConsent || isLastSentConsentLoading || targetedAdvertisingConsent === lastSentConsent) {
            return;
        }
        updateAdvertisingConsent(targetedAdvertisingConsent);
    }, [targetedAdvertisingConsent, canSendConsent, isLastSentConsentLoading, lastSentConsent]);
}

export default useSyncAdvertisingConsent;
