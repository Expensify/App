import ExpensifyCardIcon from '@assets/images/expensify-card-icon.svg';

import BaseWidgetItem from '@components/BaseWidgetItem';

import useLocalize from '@hooks/useLocalize';

import Navigation from '@libs/Navigation/Navigation';

import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type {Card} from '@src/types/onyx';

import React from 'react';

type AddShippingAddressProps = {
    card: Card;
};

function AddShippingAddress({card}: AddShippingAddressProps) {
    const {translate} = useLocalize();

    return (
        <BaseWidgetItem
            icon={ExpensifyCardIcon}
            title={translate('homePage.timeSensitiveSection.addShippingAddress.title')}
            ctaText={translate('homePage.timeSensitiveSection.addShippingAddress.cta')}
            onCtaPress={() => Navigation.navigate(ROUTES.SETTINGS_WALLET_DOMAIN_CARD.getRoute(String(card.cardID)))}
            buttonVariant={CONST.BUTTON_VARIANT.SUCCESS}
        />
    );
}

export default AddShippingAddress;
