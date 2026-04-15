import {useEffect, useEffectEvent} from 'react';
import DateUtils from '@libs/DateUtils';
import {updateAutomaticTimezone} from '@userActions/PersonalDetails';
import ONYXKEYS from '@src/ONYXKEYS';
import {isActingAsDelegateSelector} from '@src/selectors/Account';
import type {SelectedTimezone} from '@src/types/onyx/PersonalDetails';
import useAppFocusEvent from './useAppFocusEvent';
import useCurrentUserPersonalDetails from './useCurrentUserPersonalDetails';
import useOnyx from './useOnyx';

const useAutoUpdateTimezone = () => {
    const [isActingAsDelegate] = useOnyx(ONYXKEYS.ACCOUNT, {selector: isActingAsDelegateSelector});
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const timezone = currentUserPersonalDetails?.timezone ?? {};
    const updateTimezone = () => {
        if (isActingAsDelegate) {
            // Do not update timezone if user is acting as a delegate, as the timezone should be based on the primary account holder, not the delegate.
            return;
        }
        const currentTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone as SelectedTimezone;
        const hasValidCurrentTimezone = typeof currentTimezone === 'string' && currentTimezone.trim().length > 0;
        const proposedTimezone = DateUtils.formatToSupportedTimezone({
            automatic: true,
            selected: currentTimezone,
        });

        if (hasValidCurrentTimezone && timezone?.automatic && timezone?.selected !== proposedTimezone.selected) {
            updateAutomaticTimezone(proposedTimezone, currentUserPersonalDetails.accountID);
        }
    };
    const updateTimezoneEvent = useEffectEvent(updateTimezone);
    useAppFocusEvent(updateTimezone);
    useEffect(() => {
        if (!currentUserPersonalDetails.accountID) {
            // If we don't have an accountID, we can't update the timezone, so we should wait until we do before attempting to update it.
            return;
        }
        updateTimezoneEvent();
    }, [currentUserPersonalDetails.accountID]);
};

export default useAutoUpdateTimezone;
