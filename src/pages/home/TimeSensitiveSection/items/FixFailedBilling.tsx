import React from 'react';
import BaseWidgetItem from '@components/BaseWidgetItem';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useTheme from '@hooks/useTheme';
import navigateToSubscriptionPayment from '@pages/home/common/navigateToSubscriptionPayment';

function FixFailedBilling() {
    const {translate} = useLocalize();
    const theme = useTheme();
    const icons = useMemoizedLazyExpensifyIcons(['CreditCard']);

    return (
        <BaseWidgetItem
            icon={icons.CreditCard}
            transparentIconBackground
            iconFill={theme.icon}
            title={translate('homePage.timeSensitiveSection.fixFailedBilling.title')}
            subtitle={translate('homePage.timeSensitiveSection.fixFailedBilling.subtitle')}
            ctaText={translate('homePage.timeSensitiveSection.ctaFix')}
            onCtaPress={navigateToSubscriptionPayment}
            buttonProps={{danger: true}}
        />
    );
}

export default FixFailedBilling;
