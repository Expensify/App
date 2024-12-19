import React, {useEffect, useState} from 'react';
import type {StyleProp, ViewStyle} from 'react-native';
import {View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import Badge from '@components/Badge';
import Button from '@components/Button';
import useNetwork from '@hooks/useNetwork';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import * as SubscriptionUtils from '@libs/SubscriptionUtils';
import * as Expensicons from '@src/components/Icon/Expensicons';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';

type FreeTrialProps = {
    badgeStyles?: StyleProp<ViewStyle>;
    pressable?: boolean;
    addSpacing?: boolean;
};

function FreeTrial({badgeStyles, pressable = false, addSpacing = false}: FreeTrialProps) {
    const styles = useThemeStyles();
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

    const freeTrial = pressable ? (
        <Button
            icon={Expensicons.Star}
            success
            text={freeTrialText}
            onPress={() => Navigation.navigate(ROUTES.SETTINGS_SUBSCRIPTION)}
        />
    ) : (
        <Badge
            success
            text={freeTrialText}
            badgeStyles={badgeStyles}
        />
    );

    return addSpacing ? <View style={[styles.pb3, styles.ph5]}>{freeTrial}</View> : freeTrial;
}

FreeTrial.displayName = 'FreeTrial';

export default FreeTrial;
