import {useEffect, useRef} from 'react';
import {updateAutomaticTimezone} from '@userActions/PersonalDetails';
import {isActingAsDelegateSelector} from '@selectors/Account';
import type {SelectedTimezone} from '@src/types/onyx/PersonalDetails';
import useCurrentUserPersonalDetails from './useCurrentUserPersonalDetails';
import useOnyx from './useOnyx';
import ONYXKEYS from '@src/ONYXKEYS';

const THROTTLE_INTERVAL_MS = 60 * 60 * 1000; // 1 hour

const useAutoUpdateTimezone = () => {
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const timezone = currentUserPersonalDetails?.timezone ?? {};
    const accountID = currentUserPersonalDetails?.accountID;
    
    // Use useOnyx to get the Account data (contains delegatedAccess)
    const [account] = useOnyx(ONYXKEYS.ACCOUNT);
    const isDelegate = isActingAsDelegateSelector(account);
    
    // Use useRef to store per-account timestamps
    const lastUpdateTimestamps = useRef<Record<number, number>>({});

    useEffect(() => {
        // Skip auto-timezone updates for copilot/delegate sessions
        if (isDelegate) {
            return;
        }

        const currentTime = Date.now();
        
        // Get the last update timestamp for this specific account
        const lastUpdateTimestamp = lastUpdateTimestamps.current[accountID] ?? 0;

        // Throttle timezone updates to once per hour (per account)
        if (currentTime - lastUpdateTimestamp < THROTTLE_INTERVAL_MS) {
            return;
        }

        const currentTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone as SelectedTimezone;
        const hasValidCurrentTimezone = typeof currentTimezone === 'string' && currentTimezone.trim().length > 0;

        if (hasValidCurrentTimezone && timezone?.automatic && timezone?.selected !== currentTimezone) {
            // Update the timestamp for this specific account
            lastUpdateTimestamps.current[accountID] = currentTime;
            updateAutomaticTimezone(
                {
                    automatic: true,
                    selected: currentTimezone,
                },
                accountID,
            );
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [timezone?.automatic, timezone?.selected, isDelegate, accountID]);
};

export default useAutoUpdateTimezone;
