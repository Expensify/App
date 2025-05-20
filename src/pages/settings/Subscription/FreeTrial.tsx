import React, {useEffect, useState} from 'react';
import type {StyleProp, ViewStyle} from 'react-native';
import {View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import Badge from '@components/Badge';
import Button from '@components/Button';
import {Star} from '@components/Icon/Expensicons';
import useNetwork from '@hooks/useNetwork';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import {getFreeTrialText} from '@libs/SubscriptionUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';

type FreeTrialProps = {
    badgeStyles?: StyleProp<ViewStyle>;
    pressable?: boolean;
    addSpacing?: boolean;
    success?: boolean;
    inARow?: boolean;
};

function FreeTrial({badgeStyles, pressable = false, addSpacing = false, success = true, inARow = false}: FreeTrialProps) {
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
        setFreeTrialText(getFreeTrialText(policies));
    }, [isOffline, privateSubscription, policies, firstDayFreeTrial, lastDayFreeTrial]);

    if (!freeTrialText) {
        return null;
    }

    const freeTrial = pressable ? (
        <Button
            icon={Star}
            success={success}
            text={freeTrialText}
            onPress={() => Navigation.navigate(ROUTES.SETTINGS_SUBSCRIPTION.getRoute(Navigation.getActiveRoute()))}
        />
    ) : (
        <Badge
            success={success}
            text={freeTrialText}
            badgeStyles={badgeStyles}
        />
    );

    return addSpacing ? <View style={inARow ? [styles.pb3, styles.pr5, styles.w50, styles.pl1] : [styles.pb3, styles.ph5]}>{freeTrial}</View> : freeTrial;
}

FreeTrial.displayName = 'FreeTrial';

export default FreeTrial;
