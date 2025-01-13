import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import Button from '@components/Button';
import * as Illustrations from '@components/Icon/Illustrations';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import {getEarlyDiscountInfo} from '@libs/SubscriptionUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import BillingBanner from './BillingBanner';

type EarlyDiscountBannerProps = {
    /** Whether the banner is being displayed on the subscription page. */
    isSubscriptionPage: boolean;
};

function EarlyDiscountBanner({isSubscriptionPage}: EarlyDiscountBannerProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    

    const [firstDayFreeTrial] = useOnyx(ONYXKEYS.NVP_FIRST_DAY_FREE_TRIAL);
    const [lastDayFreeTrial] = useOnyx(ONYXKEYS.NVP_LAST_DAY_FREE_TRIAL);

    const initialDiscountInfo = getEarlyDiscountInfo();
    const [discountInfo, setDiscountInfo] = useState(initialDiscountInfo);
    const [isDismissed, setIsDismissed] = useState(false);

    useEffect(() => {
        const intervalID = setInterval(() => {
            setDiscountInfo(getEarlyDiscountInfo());
        }, 1000);

        return () => clearInterval(intervalID);
    }, [firstDayFreeTrial]);

    const title = isSubscriptionPage ? (
        <Text style={styles.textStrong}>
            {translate('subscription.billingBanner.earlyDiscount.subscriptionPageTitle.phrase1', {discountType: discountInfo?.discountType})}&nbsp;
            <Text>{translate('subscription.billingBanner.earlyDiscount.subscriptionPageTitle.phrase2')}</Text>
        </Text>
    ) : (
        <Text style={styles.textStrong}>
            {translate('subscription.billingBanner.earlyDiscount.onboardingChatTitle.phrase1')}&nbsp;
            <Text>{translate('subscription.billingBanner.earlyDiscount.onboardingChatTitle.phrase2', {discountType: discountInfo?.discountType})}</Text>
        </Text>
    );

    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const rightComponent = useMemo(() => {
        const smallScreenStyle = shouldUseNarrowLayout ? [styles.flex0, styles.flexBasis100, styles.flexRow, styles.justifyContentCenter] : [];
        return (
            <View style={[styles.flexRow, styles.gap2, smallScreenStyle]}>
                <Button
                    success
                    text="Claim offer"
                    onPress={() => Navigation.navigate(ROUTES.SETTINGS_SUBSCRIPTION)}
                />
                {discountInfo?.discountType === 25 && (
                    <Button
                        text="No thanks"
                        onPress={() => setIsDismissed(true)}
                    />
                )}
            </View>
        );
    }, [shouldUseNarrowLayout, styles.flex0, styles.flexRow, styles.flexBasis100, styles.gap2, styles.justifyContentCenter, discountInfo]);

    if (!firstDayFreeTrial || !lastDayFreeTrial || !discountInfo) {
        return null;
    }

    if (isDismissed && !isSubscriptionPage) {
        return null;
    }

    return (
        <BillingBanner
            title={title}
            subtitle={translate('subscription.billingBanner.earlyDiscount.subtitle', {
                days: discountInfo?.days,
                hours: discountInfo?.hours,
                minutes: discountInfo?.minutes,
                seconds: discountInfo?.seconds,
            })}
            subtitleStyle={[styles.mt1, styles.mutedNormalTextLabel]}
            icon={Illustrations.TreasureChest}
            rightComponent={!isSubscriptionPage && rightComponent}
        />
    );
}

EarlyDiscountBanner.displayName = 'EarlyDiscountBanner';

export default EarlyDiscountBanner;
