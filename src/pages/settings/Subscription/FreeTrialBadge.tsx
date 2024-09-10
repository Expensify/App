import React, {useEffect} from 'react';
import type {StyleProp, ViewStyle} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import Badge from '@components/Badge';
import useDebouncedState from '@hooks/useDebouncedState';
import * as SubscriptionUtils from '@libs/SubscriptionUtils';
import ONYXKEYS from '@src/ONYXKEYS';

type FreeTrialBadgeProps = {
    badgeStyles?: StyleProp<ViewStyle>;
};

function FreeTrialBadge({badgeStyles}: FreeTrialBadgeProps) {
    const [policies] = useOnyx(ONYXKEYS.COLLECTION.POLICY);
    const [firstDayFreeTrial] = useOnyx(ONYXKEYS.NVP_FIRST_DAY_FREE_TRIAL);
    const [lastDayFreeTrial] = useOnyx(ONYXKEYS.NVP_LAST_DAY_FREE_TRIAL);
    /* eslint-disable @typescript-eslint/no-unused-vars */
    const [freeTrialText, debouncedFreeTrialText, setFreeTrialText] = useDebouncedState<string | undefined>(undefined);

    useEffect(() => {
        setFreeTrialText(SubscriptionUtils.getFreeTrialText(policies));
    }, [policies, firstDayFreeTrial, lastDayFreeTrial, setFreeTrialText]);

    if (!debouncedFreeTrialText) {
        return null;
    }

    return (
        <Badge
            success
            text={debouncedFreeTrialText}
            badgeStyles={badgeStyles}
        />
    );
}

FreeTrialBadge.displayName = 'FreeTrialBadge';

export default FreeTrialBadge;
