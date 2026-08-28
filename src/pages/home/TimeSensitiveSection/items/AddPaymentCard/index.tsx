import BaseWidgetItem from '@components/BaseWidgetItem';

import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useTheme from '@hooks/useTheme';

import navigateToSubscriptionPayment from '@pages/home/common/navigateToSubscriptionPayment';

import CONST from '@src/CONST';

import React from 'react';

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
            onCtaPress={navigateToSubscriptionPayment}
            buttonVariant={CONST.BUTTON_VARIANT.SUCCESS}
        />
    );
}

export default AddPaymentCard;
