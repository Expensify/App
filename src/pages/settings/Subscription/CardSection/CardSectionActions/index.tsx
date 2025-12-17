import React, {useMemo} from 'react';
import * as Expensicons from '@components/Icon/Expensicons';
import ThreeDotsMenu from '@components/ThreeDotsMenu';
import type ThreeDotsMenuProps from '@components/ThreeDotsMenu/types';
import useLocalize from '@hooks/useLocalize';
import Navigation from '@navigation/Navigation';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';

const anchorAlignment = {
    horizontal: CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.RIGHT,
    vertical: CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.TOP,
};

function CardSectionActions() {
    const {translate} = useLocalize();

    const overflowMenu: ThreeDotsMenuProps['menuItems'] = useMemo(
        () => [
            {
                icon: Expensicons.CreditCard,
                text: translate('subscription.cardSection.changeCard'),
                onSelected: () => Navigation.navigate(ROUTES.SETTINGS_SUBSCRIPTION_ADD_PAYMENT_CARD),
            },
            {
                icon: Expensicons.MoneyCircle,
                text: translate('subscription.cardSection.changeCurrency'),
                onSelected: () => Navigation.navigate(ROUTES.SETTINGS_SUBSCRIPTION_CHANGE_BILLING_CURRENCY),
            },
        ],
        [translate],
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
