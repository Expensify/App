import React from 'react';
import BaseWidgetItem from '@components/BaseWidgetItem';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useTheme from '@hooks/useTheme';
import navigateFromAddPaymentCardItem from './navigateFromAddPaymentCardItem';

function AddPaymentCard() {
    const {translate} = useLocalize();
    const icons = useMemoizedLazyExpensifyIcons(['CreditCard']);
    const theme = useTheme();

    return (
        <BaseWidgetItem
            icon={icons.CreditCard}
            iconBackgroundColor={theme.widgetIconBG}
            iconFill={theme.widgetIconFill}
            title={translate('homePage.timeSensitiveSection.addPaymentCard.title')}
            subtitle={translate('homePage.timeSensitiveSection.addPaymentCard.subtitle')}
            ctaText={translate('homePage.timeSensitiveSection.addPaymentCard.cta')}
            onCtaPress={navigateFromAddPaymentCardItem}
            buttonProps={{success: true}}
        />
    );
}

export default AddPaymentCard;
