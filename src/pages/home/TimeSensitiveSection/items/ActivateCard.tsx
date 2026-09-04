import ExpensifyCardIcon from '@assets/images/expensify-card-icon.svg';

import BaseWidgetItem from '@components/BaseWidgetItem';

import useLocalize from '@hooks/useLocalize';

import Navigation from '@libs/Navigation/Navigation';

import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type {Card} from '@src/types/onyx';

import React from 'react';

type ActivateCardProps = {
    card: Card;
};

function ActivateCard({card}: ActivateCardProps) {
    const {translate} = useLocalize();

    return (
        <BaseWidgetItem
            icon={ExpensifyCardIcon}
            title={translate('homePage.timeSensitiveSection.activateCard.title')}
            subtitle={translate('homePage.timeSensitiveSection.activateCard.subtitle')}
            ctaText={translate('homePage.timeSensitiveSection.activateCard.cta')}
            onCtaPress={() => Navigation.navigate(ROUTES.SETTINGS_WALLET_CARD_ACTIVATE.getRoute(String(card.cardID)))}
            buttonVariant={CONST.BUTTON_VARIANT.SUCCESS}
        />
    );
}

export default ActivateCard;
