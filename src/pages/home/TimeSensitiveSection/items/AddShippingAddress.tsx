import React from 'react';
import ExpensifyCardIcon from '@assets/images/expensify-card-icon.svg';
import BaseWidgetItem from '@components/BaseWidgetItem';
import useLocalize from '@hooks/useLocalize';
import useTheme from '@hooks/useTheme';
import Navigation from '@libs/Navigation/Navigation';
import ROUTES from '@src/ROUTES';
import type {Card} from '@src/types/onyx';

type AddShippingAddressProps = {
    card: Card;
};

function AddShippingAddress({card}: AddShippingAddressProps) {
    const theme = useTheme();
    const {translate} = useLocalize();

    return (
        <BaseWidgetItem
            icon={ExpensifyCardIcon}
            iconBackgroundColor={theme.widgetIconBG}
            iconFill={theme.widgetIconFill}
            title={translate('homePage.timeSensitiveSection.addShippingAddress.title')}
            subtitle={translate('homePage.timeSensitiveSection.addShippingAddress.subtitle')}
            ctaText={translate('homePage.timeSensitiveSection.addShippingAddress.cta')}
            onCtaPress={() => Navigation.navigate(ROUTES.SETTINGS_WALLET_DOMAIN_CARD.getRoute(String(card.cardID)))}
        />
    );
}

export default AddShippingAddress;
