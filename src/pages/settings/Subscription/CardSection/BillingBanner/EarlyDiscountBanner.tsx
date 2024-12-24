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

function EarlyDiscountBanner({isSubscriptionPage}) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();

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
            {discountInfo?.discountType}% off your first year!&nbsp;
            <Text>Just add payment card and start an annual subscription!</Text>
        </Text>
    ) : (
        <Text style={styles.textStrong}>
            Limited time offer:&nbsp;
            <Text>{discountInfo?.discountType}% off your first year!</Text>
        </Text>
    );

    const formatTimeRemaining = useCallback(() => {
        if (discountInfo?.days === 0) {
            return `Claim within ${discountInfo?.hours}h : ${discountInfo?.minutes}m : ${discountInfo?.seconds}s`;
        }
        return `Claim within ${discountInfo?.days}d : ${discountInfo?.hours}h : ${discountInfo?.minutes}m : ${discountInfo?.seconds}s`;
    }, [discountInfo]);

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
            subtitle={formatTimeRemaining()}
            subtitleStyle={[styles.mt1, styles.mutedNormalTextLabel]}
            icon={Illustrations.TreasureChest}
            rightComponent={!isSubscriptionPage && rightComponent}
        />
    );
}

EarlyDiscountBanner.displayName = 'EarlyDiscountBanner';

export default EarlyDiscountBanner;
