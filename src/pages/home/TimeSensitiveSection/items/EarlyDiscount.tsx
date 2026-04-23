import React from 'react';
import BaseWidgetItem from '@components/BaseWidgetItem';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useTheme from '@hooks/useTheme';
import navigateToSubscriptionPayment from '@pages/home/common/navigateToSubscriptionPayment';
import type {DiscountInfo} from '@libs/SubscriptionUtils';

type EarlyDiscountProps = {
    /** Live discount information used to render the title (discountType) and the live countdown (hours/minutes/seconds). */
    discountInfo: DiscountInfo;
};

function EarlyDiscount({discountInfo}: EarlyDiscountProps) {
    const {translate} = useLocalize();
    const theme = useTheme();
    const icons = useMemoizedLazyExpensifyIcons(['Stopwatch']);

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
            onCtaPress={navigateToSubscriptionPayment}
            buttonProps={{success: true}}
        />
    );
}

export default EarlyDiscount;
