import BaseWidgetItem from '@components/BaseWidgetItem';

import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';

import createDynamicRoute from '@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute';
import Navigation from '@libs/Navigation/Navigation';

import CONST from '@src/CONST';
import {DYNAMIC_ROUTES} from '@src/ROUTES';
import type {Card} from '@src/types/onyx';

import React from 'react';

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
            title={translate('homePage.timeSensitiveSection.fixPersonalCardConnection.title', {cardName: card?.cardName})}
            subtitle={translate('homePage.timeSensitiveSection.fixPersonalCardConnection.subtitle')}
            ctaText={translate('homePage.timeSensitiveSection.ctaFix')}
            onCtaPress={() => Navigation.navigate(createDynamicRoute(DYNAMIC_ROUTES.PERSONAL_CARD_DETAILS.getRoute(String(card.cardID))))}
            buttonVariant={CONST.BUTTON_VARIANT.DANGER}
        />
    );
}

export default FixPersonalCardConnection;
