import BaseWidgetItem from '@components/BaseWidgetItem';

import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';

import navigateToSubscriptionPayment from '@pages/home/common/navigateToSubscriptionPayment';

import CONST from '@src/CONST';

import React from 'react';

function AddPaymentCard() {
    const {translate} = useLocalize();
    const icons = useMemoizedLazyExpensifyIcons(['CreditCard']);

    return (
        <BaseWidgetItem
            sentryLabel={CONST.SENTRY_LABEL.HOME_PAGE.TIME_SENSITIVE_ITEM.ADD_PAYMENT_CARD}
            buttonSentryLabel={CONST.SENTRY_LABEL.HOME_PAGE.TIME_SENSITIVE_ITEM_BUTTON.ADD_PAYMENT_CARD}
            icon={icons.CreditCard}
            title={translate('homePage.timeSensitiveSection.addPaymentCard.title')}
            subtitle={translate('homePage.timeSensitiveSection.addPaymentCard.subtitle')}
            ctaText={translate('homePage.timeSensitiveSection.addPaymentCard.cta')}
            onCtaPress={navigateToSubscriptionPayment}
            buttonVariant={CONST.BUTTON_VARIANT.SUCCESS}
        />
    );
}

export default AddPaymentCard;
