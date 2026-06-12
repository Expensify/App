import React from 'react';
import BaseWidgetItem from '@components/BaseWidgetItem';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import navigateToSubscriptionPayment from '@pages/home/common/navigateToSubscriptionPayment';
import colors from '@styles/theme/colors';

function FixFailedBilling() {
    const {translate} = useLocalize();
    const icons = useMemoizedLazyExpensifyIcons(['CreditCard']);

    return (
        <BaseWidgetItem
            icon={icons.CreditCard}
            iconBackgroundColor={colors.tangerine100}
            iconFill={colors.tangerine500}
            title={translate('homePage.timeSensitiveSection.fixFailedBilling.title')}
            subtitle={translate('homePage.timeSensitiveSection.fixFailedBilling.subtitle')}
            ctaText={translate('homePage.timeSensitiveSection.ctaFix')}
            onCtaPress={navigateToSubscriptionPayment}
            buttonProps={{danger: true}}
        />
    );
}

export default FixFailedBilling;
