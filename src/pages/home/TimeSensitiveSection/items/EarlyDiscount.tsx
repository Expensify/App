import React, {useCallback} from 'react';
import BaseWidgetItem from '@components/BaseWidgetItem';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useTheme from '@hooks/useTheme';
import Navigation from '@libs/Navigation/Navigation';
import type {DiscountInfo} from '@libs/SubscriptionUtils';
import ROUTES from '@src/ROUTES';

type EarlyDiscountProps = {
    /** Live discount information used to render the title (discountType) and the live countdown (hours/minutes/seconds). */
    discountInfo: DiscountInfo;
};

function EarlyDiscount({discountInfo}: EarlyDiscountProps) {
    const {translate} = useLocalize();
    const theme = useTheme();
    const icons = useMemoizedLazyExpensifyIcons(['Stopwatch']);

    // Match EarlyDiscountBanner: navigate to Account > Subscription (the page itself)
    // rather than the Add Payment Card screen, so the user lands on the subscription
    // overview where they can claim the discount.
    const onCtaPress = useCallback(() => {
        Navigation.navigate(ROUTES.SETTINGS_SUBSCRIPTION.getRoute(Navigation.getActiveRoute()));
    }, []);

    return (
        <BaseWidgetItem
            icon={icons.Stopwatch}
            iconBackgroundColor={theme.widgetIconBG}
            iconFill={theme.widgetIconFill}
            title={translate('homePage.timeSensitiveSection.earlyDiscount.title', {discountType: discountInfo.discountType})}
            supportingText={translate('homePage.timeSensitiveSection.earlyDiscount.supportingText', {
                hours: discountInfo.hours,
                minutes: discountInfo.minutes,
                seconds: discountInfo.seconds,
            })}
            ctaText={translate('homePage.timeSensitiveSection.earlyDiscount.cta')}
            onCtaPress={onCtaPress}
            buttonProps={{success: true}}
        />
    );
}

export default EarlyDiscount;
