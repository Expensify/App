import {useEffect} from 'react';
import {updateAutomaticTimezone} from '@userActions/PersonalDetails';
import {isActingAsDelegateSelector} from '@selectors/Account';
import type {SelectedTimezone} from '@src/types/onyx/PersonalDetails';
import useCurrentUserPersonalDetails from './useCurrentUserPersonalDetails';

const THROTTLE_INTERVAL_MS = 60 * 60 * 1000; // 1 hour

let lastUpdateTimestamp = 0;

const useAutoUpdateTimezone = () => {
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const timezone = currentUserPersonalDetails?.timezone ?? {};
    const account = currentUserPersonalDetails?.account;
    const isDelegate = isActingAsDelegateSelector(account);

    useEffect(() => {
        // Skip auto-timezone updates for copilot/delegate sessions
        if (isDelegate) {
            return;
        }

        const currentTime = Date.now();

        // Throttle timezone updates to once per hour
        if (currentTime - lastUpdateTimestamp < THROTTLE_INTERVAL_MS) {
            return;
        }

        const currentTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone as SelectedTimezone;
        const hasValidCurrentTimezone = typeof currentTimezone === 'string' && currentTimezone.trim().length > 0;

        if (hasValidCurrentTimezone && timezone?.automatic && timezone?.selected !== currentTimezone) {
            lastUpdateTimestamp = currentTime;
            updateAutomaticTimezone(
                {
                    automatic: true,
                    selected: currentTimezone,
                },
                currentUserPersonalDetails.accountID,
            );
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [timezone?.automatic, timezone?.selected, isDelegate]);
};

export default useAutoUpdateTimezone;
