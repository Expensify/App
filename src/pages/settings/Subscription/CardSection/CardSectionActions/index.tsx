import ThreeDotsMenu from '@components/ThreeDotsMenu';
import type ThreeDotsMenuProps from '@components/ThreeDotsMenu/types';

import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';

import createDynamicRoute from '@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute';

import Navigation from '@navigation/Navigation';

import CONST from '@src/CONST';
import ROUTES, {DYNAMIC_ROUTES} from '@src/ROUTES';

import React from 'react';

const anchorAlignment = {
    horizontal: CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.RIGHT,
    vertical: CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.TOP,
};

function CardSectionActions() {
    const {translate} = useLocalize();
    const icons = useMemoizedLazyExpensifyIcons(['CreditCard', 'MoneyCircle']);

    const overflowMenu: ThreeDotsMenuProps['menuItems'] = [
        {
            icon: icons.CreditCard,
            text: translate('subscription.cardSection.changeCard'),
            sentryLabel: CONST.SENTRY_LABEL.SETTINGS_SUBSCRIPTION.PAYMENT_CARD_MENU_ITEM.CHANGE_CARD,
            onSelected: () => Navigation.navigate(createDynamicRoute(DYNAMIC_ROUTES.ADD_PAYMENT_CARD.path)),
        },
        {
            icon: icons.MoneyCircle,
            text: translate('subscription.cardSection.changeCurrency'),
            sentryLabel: CONST.SENTRY_LABEL.SETTINGS_SUBSCRIPTION.PAYMENT_CARD_MENU_ITEM.CHANGE_CURRENCY,
            onSelected: () => Navigation.navigate(ROUTES.SETTINGS_SUBSCRIPTION_CHANGE_BILLING_CURRENCY),
        },
    ];

    return (
        <ThreeDotsMenu
            sentryLabel={CONST.SENTRY_LABEL.SETTINGS_SUBSCRIPTION.PAYMENT_CARD_MENU}
            shouldSelfPosition
            menuItems={overflowMenu}
            anchorAlignment={anchorAlignment}
            shouldOverlay
        />
    );
}

export default CardSectionActions;
