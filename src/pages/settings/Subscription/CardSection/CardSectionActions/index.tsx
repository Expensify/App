import ThreeDotsMenu from '@components/ThreeDotsMenu';
import type ThreeDotsMenuProps from '@components/ThreeDotsMenu/types';

import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';

import createDynamicRoute from '@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute';

import Navigation from '@navigation/Navigation';

import CONST from '@src/CONST';
import ROUTES, {DYNAMIC_ROUTES} from '@src/ROUTES';

import React, {useMemo} from 'react';

const anchorAlignment = {
    horizontal: CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.RIGHT,
    vertical: CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.TOP,
};

function CardSectionActions() {
    const {translate} = useLocalize();
    const icons = useMemoizedLazyExpensifyIcons(['CreditCard', 'MoneyCircle']);

    const overflowMenu: ThreeDotsMenuProps['menuItems'] = useMemo(
        () => [
            {
                icon: icons.CreditCard,
                text: translate('subscription.cardSection.changeCard'),
                onSelected: () => Navigation.navigate(createDynamicRoute(DYNAMIC_ROUTES.ADD_PAYMENT_CARD.path)),
            },
            {
                icon: icons.MoneyCircle,
                text: translate('subscription.cardSection.changeCurrency'),
                onSelected: () => Navigation.navigate(ROUTES.SETTINGS_SUBSCRIPTION_CHANGE_BILLING_CURRENCY),
            },
        ],
        [translate, icons.CreditCard, icons.MoneyCircle],
    );

    return (
        <ThreeDotsMenu
            shouldSelfPosition
            menuItems={overflowMenu}
            anchorAlignment={anchorAlignment}
            shouldOverlay
        />
    );
}

export default CardSectionActions;
