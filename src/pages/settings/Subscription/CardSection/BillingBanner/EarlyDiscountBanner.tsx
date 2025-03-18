import React, {useEffect, useMemo, useState} from 'react';
import {View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import Button from '@components/Button';
import Icon from '@components/Icon';
import * as Expensicons from '@components/Icon/Expensicons';
import * as Illustrations from '@components/Icon/Illustrations';
import {PressableWithFeedback} from '@components/Pressable';
import Text from '@components/Text';
import Tooltip from '@components/Tooltip';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import {getEarlyDiscountInfo} from '@libs/SubscriptionUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import BillingBanner from './BillingBanner';

type EarlyDiscountBannerProps = {
    /** Whether the banner is being displayed on the subscription page. */
    isSubscriptionPage: boolean;

    /** The guide booking button to display */
    GuideBookingButton?: React.JSX.Element;

    /** Function to trigger when the discount banner is dismissed */
    onDismissedDiscountBanner?: () => void;
};

function EarlyDiscountBanner({isSubscriptionPage, GuideBookingButton, onDismissedDiscountBanner}: EarlyDiscountBannerProps) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const {translate} = useLocalize();

    const [firstDayFreeTrial] = useOnyx(ONYXKEYS.NVP_FIRST_DAY_FREE_TRIAL);
    const [lastDayFreeTrial] = useOnyx(ONYXKEYS.NVP_LAST_DAY_FREE_TRIAL);

    const initialDiscountInfo = getEarlyDiscountInfo();
    const [discountInfo, setDiscountInfo] = useState(initialDiscountInfo);
    const [isDismissed, setIsDismissed] = useState(false);
    const {shouldUseNarrowLayout} = useResponsiveLayout();

    useEffect(() => {
        const intervalID = setInterval(() => {
            setDiscountInfo(getEarlyDiscountInfo());
        }, 1000);

        return () => clearInterval(intervalID);
    }, [firstDayFreeTrial]);

    const dismissButton = useMemo(
        () =>
            discountInfo?.discountType === 25 && (
                <Tooltip text={translate('common.close')}>
                    <PressableWithFeedback
                        onPress={() => {
                            setIsDismissed(true);
                            onDismissedDiscountBanner?.();
                        }}
                        role={CONST.ROLE.BUTTON}
                        accessibilityLabel={translate('common.close')}
                    >
                        <Icon
                            src={Expensicons.Close}
                            fill={theme.icon}
                        />
                    </PressableWithFeedback>
                </Tooltip>
            ),
        [theme.icon, translate, onDismissedDiscountBanner, discountInfo?.discountType],
    );

    const rightComponent = useMemo(() => {
        const smallScreenStyle = shouldUseNarrowLayout ? [styles.flex0, styles.flexBasis100, styles.justifyContentCenter] : [];
        return (
            <View style={[styles.flexRow, styles.gap2, smallScreenStyle, styles.alignItemsCenter]}>
                {GuideBookingButton}
                <Button
                    success
                    style={shouldUseNarrowLayout ? styles.flex1 : styles.mr2}
                    text={translate('subscription.billingBanner.earlyDiscount.claimOffer')}
                    onPress={() => Navigation.navigate(ROUTES.SETTINGS_SUBSCRIPTION.getRoute(Navigation.getActiveRoute()))}
                />
                {!shouldUseNarrowLayout && dismissButton}
            </View>
        );
    }, [
        shouldUseNarrowLayout,
        styles.flex0,
        styles.mr2,
        styles.flexBasis100,
        styles.alignItemsCenter,
        styles.justifyContentCenter,
        styles.flexRow,
        styles.gap2,
        styles.flex1,
        translate,
        GuideBookingButton,
        dismissButton,
    ]);

    if (!firstDayFreeTrial || !lastDayFreeTrial || !discountInfo) {
        return null;
    }

    if (isDismissed && !isSubscriptionPage) {
        return null;
    }

    const title = isSubscriptionPage ? (
        <Text style={styles.textStrong}>
            {translate('subscription.billingBanner.earlyDiscount.subscriptionPageTitle.phrase1', {discountType: discountInfo?.discountType})}&nbsp;
            <Text>{translate('subscription.billingBanner.earlyDiscount.subscriptionPageTitle.phrase2')}</Text>
        </Text>
    ) : (
        <View style={[styles.justifyContentBetween, styles.flexRow]}>
            <Text style={(styles.textStrong, styles.flexShrink1)}>
                {translate('subscription.billingBanner.earlyDiscount.onboardingChatTitle.phrase1')}&nbsp;
                <Text>{translate('subscription.billingBanner.earlyDiscount.onboardingChatTitle.phrase2', {discountType: discountInfo?.discountType})}</Text>
            </Text>
            {shouldUseNarrowLayout && dismissButton}
        </View>
    );

    return (
        <BillingBanner
            title={title}
            style={!isSubscriptionPage && [styles.hoveredComponentBG, styles.borderBottom]}
            subtitle={translate('subscription.billingBanner.earlyDiscount.subtitle', {
                days: discountInfo?.days,
                hours: discountInfo?.hours,
                minutes: discountInfo?.minutes,
                seconds: discountInfo?.seconds,
            })}
            subtitleStyle={[styles.mt1, styles.mutedNormalTextLabel, isSubscriptionPage && StyleUtils.getTextColorStyle(theme.trialTimer)]}
            icon={Illustrations.TreasureChest}
            rightComponent={!isSubscriptionPage && rightComponent}
        />
    );
}

EarlyDiscountBanner.displayName = 'EarlyDiscountBanner';

export default EarlyDiscountBanner;
