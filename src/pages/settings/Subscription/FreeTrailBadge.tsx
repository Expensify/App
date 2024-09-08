import React from 'react';
import {useOnyx} from 'react-native-onyx';
import Badge from '@components/Badge';
import * as SubscriptionUtils from '@libs/SubscriptionUtils';
import ONYXKEYS from '@src/ONYXKEYS';

function FreeTrialBadge() {
    const [policies] = useOnyx(ONYXKEYS.COLLECTION.POLICY);
    const [firstDayFreeTrial] = useOnyx(ONYXKEYS.NVP_FIRST_DAY_FREE_TRIAL);
    const [lastDayFreeTrial] = useOnyx(ONYXKEYS.NVP_LAST_DAY_FREE_TRIAL);

    const freeTrialText = SubscriptionUtils.getFreeTrialText(policies, firstDayFreeTrial, lastDayFreeTrial);

    if (!freeTrialText) {
        return null;
    }

    return (
        <Badge
            success
            text={freeTrialText}
        />
    );
}

FreeTrialBadge.displayName = 'FreeTrialBadge';

export default FreeTrialBadge;
