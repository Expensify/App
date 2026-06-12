import React from 'react';
import BaseWidgetItem from '@components/BaseWidgetItem';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import Navigation from '@libs/Navigation/Navigation';
import colors from '@styles/theme/colors';
import ROUTES from '@src/ROUTES';
import type {Card} from '@src/types/onyx';

type FixPersonalCardConnectionProps = {
    /** The card with broken connection */
    card: Card;
};

function FixPersonalCardConnection({card}: FixPersonalCardConnectionProps) {
    const {translate} = useLocalize();
    const icons = useMemoizedLazyExpensifyIcons(['Connect']);

    return (
        <BaseWidgetItem
            icon={icons.Connect}
            iconBackgroundColor={colors.tangerine100}
            iconFill={colors.tangerine500}
            title={translate('homePage.timeSensitiveSection.fixPersonalCardConnection.title', {cardName: card?.cardName})}
            subtitle={translate('homePage.timeSensitiveSection.fixPersonalCardConnection.subtitle')}
            ctaText={translate('homePage.timeSensitiveSection.ctaFix')}
            onCtaPress={() => Navigation.navigate(ROUTES.SETTINGS_WALLET_PERSONAL_CARD_DETAILS.getRoute(String(card.cardID)))}
            buttonProps={{danger: true}}
        />
    );
}

export default FixPersonalCardConnection;
