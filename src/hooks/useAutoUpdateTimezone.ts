import {useEffect, useRef} from 'react';
import {updateAutomaticTimezone} from '@userActions/PersonalDetails';
import type {SelectedTimezone} from '@src/types/onyx/PersonalDetails';
import useCurrentUserPersonalDetails from './useCurrentUserPersonalDetails';

const useAutoUpdateTimezone = () => {
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const timezone = currentUserPersonalDetails?.timezone ?? {};
    // Tracks the timezone value already dispatched to prevent duplicate calls
    // when intermediate Onyx writes (e.g. HybridApp transition) temporarily
    // reset timezone.selected before the in-flight request is confirmed.
    const pendingTimezone = useRef<string | undefined>(undefined);

    useEffect(() => {
        const currentTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone as SelectedTimezone;
        const hasValidCurrentTimezone = typeof currentTimezone === 'string' && currentTimezone.trim().length > 0;

        if (hasValidCurrentTimezone && timezone?.automatic && timezone?.selected !== currentTimezone && pendingTimezone.current !== currentTimezone) {
            pendingTimezone.current = currentTimezone;
            updateAutomaticTimezone(
                {
                    automatic: true,
                    selected: currentTimezone,
                },
                currentUserPersonalDetails.accountID,
            );
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [timezone?.automatic, timezone?.selected]);
};

export default useAutoUpdateTimezone;
