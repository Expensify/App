import React, {useEffect, useMemo, useState} from 'react';
import {View} from 'react-native';
import Button from '@components/Button';
import Icon from '@components/Icon';
import * as Expensicons from '@components/Icon/Expensicons';
import {PressableWithFeedback} from '@components/Pressable';
import RenderHTML from '@components/RenderHTML';
import Tooltip from '@components/Tooltip';
import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
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

    /** The Onboarding help dropdown button to display */
    onboardingHelpDropdownButton?: React.JSX.Element;

    /** Function to trigger when the discount banner is dismissed */
    onDismissedDiscountBanner?: () => void;

    /** Has user active Schedule call with guide */
    hasActiveScheduledCall?: boolean;
};

function EarlyDiscountBanner({isSubscriptionPage, onboardingHelpDropdownButton, onDismissedDiscountBanner, hasActiveScheduledCall}: EarlyDiscountBannerProps) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const {translate} = useLocalize();
    const illustrations = useMemoizedLazyIllustrations(['TreasureChest'] as const);

    const [firstDayFreeTrial] = useOnyx(ONYXKEYS.NVP_FIRST_DAY_FREE_TRIAL, {canBeMissing: true});
    const [lastDayFreeTrial] = useOnyx(ONYXKEYS.NVP_LAST_DAY_FREE_TRIAL, {canBeMissing: true});

    const initialDiscountInfo = getEarlyDiscountInfo(firstDayFreeTrial);
    const [discountInfo, setDiscountInfo] = useState(initialDiscountInfo);
    const [isDismissed, setIsDismissed] = useState(false);
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    useEffect(() => {
        const intervalID = setInterval(() => {
            setDiscountInfo(getEarlyDiscountInfo(firstDayFreeTrial));
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
                {onboardingHelpDropdownButton}
                <Button
                    success={!hasActiveScheduledCall}
                    style={shouldUseNarrowLayout ? [styles.earlyDiscountButton, styles.flexGrow2] : styles.mr2}
                    text={translate('subscription.billingBanner.earlyDiscount.claimOffer')}
                    onPress={() => Navigation.navigate(ROUTES.SETTINGS_SUBSCRIPTION.getRoute(Navigation.getActiveRoute()))}
                />
                {!shouldUseNarrowLayout && dismissButton}
            </View>
        );
    }, [
        shouldUseNarrowLayout,
        hasActiveScheduledCall,
        styles.flex0,
        styles.flexBasis100,
        styles.justifyContentCenter,
        styles.flexRow,
        styles.gap2,
        styles.alignItemsCenter,
        styles.earlyDiscountButton,
        styles.flexGrow2,
        styles.mr2,
        onboardingHelpDropdownButton,
        translate,
        dismissButton,
    ]);

    if (!firstDayFreeTrial || !lastDayFreeTrial || !discountInfo) {
        return null;
    }

    if (isDismissed && !isSubscriptionPage) {
        return null;
    }

    const title = isSubscriptionPage ? (
        <RenderHTML
            html={translate('subscription.billingBanner.earlyDiscount.subscriptionPageTitle', {
                discountType: discountInfo?.discountType,
            })}
        />
    ) : (
        <View style={[styles.justifyContentBetween, styles.flexRow]}>
            <RenderHTML
                html={translate('subscription.billingBanner.earlyDiscount.onboardingChatTitle', {
                    discountType: discountInfo?.discountType,
                })}
            />
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
            icon={illustrations.TreasureChest}
            rightComponent={!isSubscriptionPage && rightComponent}
        />
    );
}

EarlyDiscountBanner.displayName = 'EarlyDiscountBanner';

export default EarlyDiscountBanner;
