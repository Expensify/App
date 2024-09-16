import React, {useEffect, useState} from 'react';
import type {StyleProp, ViewStyle} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import Badge from '@components/Badge';
import useNetwork from '@hooks/useNetwork';
import * as SubscriptionUtils from '@libs/SubscriptionUtils';
import ONYXKEYS from '@src/ONYXKEYS';

type FreeTrialBadgeProps = {
    badgeStyles?: StyleProp<ViewStyle>;
};

function FreeTrialBadge({badgeStyles}: FreeTrialBadgeProps) {
    const [policies] = useOnyx(ONYXKEYS.COLLECTION.POLICY);
    const [firstDayFreeTrial] = useOnyx(ONYXKEYS.NVP_FIRST_DAY_FREE_TRIAL);
    const [lastDayFreeTrial] = useOnyx(ONYXKEYS.NVP_LAST_DAY_FREE_TRIAL);
    const [privateSubscription] = useOnyx(ONYXKEYS.NVP_PRIVATE_SUBSCRIPTION);

    const [freeTrialText, setFreeTrialText] = useState<string | undefined>(undefined);
    const {isOffline} = useNetwork();

    useEffect(() => {
        if (!privateSubscription && !isOffline) {
            return;
        }
        setFreeTrialText(SubscriptionUtils.getFreeTrialText(policies));
    }, [isOffline, privateSubscription, policies, firstDayFreeTrial, lastDayFreeTrial]);

    if (!freeTrialText) {
        return null;
    }

    return (
        <Badge
            success
            text={freeTrialText}
            badgeStyles={badgeStyles}
        />
    );
}

FreeTrialBadge.displayName = 'FreeTrialBadge';

export default FreeTrialBadge;
