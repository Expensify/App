import {useEffect, useRef} from 'react';
import {updateAutomaticTimezone} from '@userActions/PersonalDetails';
import type {SelectedTimezone} from '@src/types/onyx/PersonalDetails';
import useCurrentUserPersonalDetails from './useCurrentUserPersonalDetails';

const useAutoUpdateTimezone = () => {
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const timezone = currentUserPersonalDetails?.timezone ?? {};
    // Tracks the timezone value already dispatched to prevent duplicate calls
    // eg. between OldDot->NewDot transition and two app instances in different timezones
    // fighting each other
    const lastTimezone = useRef<string | undefined>(undefined);

    useEffect(() => {
        const currentTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone as SelectedTimezone;
        const hasValidCurrentTimezone = typeof currentTimezone === 'string' && currentTimezone.trim().length > 0;
        const hasTimezoneChangedInOnyx = timezone?.selected !== currentTimezone;
        const hasTimezoneChanged = lastTimezone.current !== currentTimezone;

        if (hasValidCurrentTimezone && timezone?.automatic && hasTimezoneChangedInOnyx && hasTimezoneChanged) {
            lastTimezone.current = currentTimezone;
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
