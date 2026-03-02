import React from 'react';
import ExpensifyCardIcon from '@assets/images/expensify-card-icon.svg';
import BaseWidgetItem from '@components/BaseWidgetItem';
import useLocalize from '@hooks/useLocalize';
import useTheme from '@hooks/useTheme';
import Navigation from '@libs/Navigation/Navigation';
import ROUTES from '@src/ROUTES';
import type {Card} from '@src/types/onyx';

type ActivateCardProps = {
    card: Card;
};

function ActivateCard({card}: ActivateCardProps) {
    const theme = useTheme();
    const {translate} = useLocalize();

    return (
        <BaseWidgetItem
            icon={ExpensifyCardIcon}
            iconBackgroundColor={theme.widgetIconBG}
            iconFill={theme.widgetIconFill}
            title={translate('homePage.timeSensitiveSection.activateCard.title')}
            subtitle={translate('homePage.timeSensitiveSection.activateCard.subtitle')}
            ctaText={translate('homePage.timeSensitiveSection.activateCard.cta')}
            onCtaPress={() => Navigation.navigate(ROUTES.SETTINGS_WALLET_CARD_ACTIVATE.getRoute(String(card.cardID)))}
            buttonProps={{success: true}}
        />
    );
}

export default ActivateCard;
