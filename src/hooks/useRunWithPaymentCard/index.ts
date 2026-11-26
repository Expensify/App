import useOnyx from '@hooks/useOnyx';

import createDynamicRoute from '@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute';
import Navigation from '@libs/Navigation/Navigation';
import {doesUserHavePaymentCardAdded} from '@libs/SubscriptionUtils';

import type CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import {DYNAMIC_ROUTES} from '@src/ROUTES';

import type {ValueOf} from 'type-fest';

/**
 * Returns a function that runs a domain change which charges the user's payment card. Without a card, it opens the
 * domain payment card page, which makes the change for the given flow once the card is added.
 */
function useRunWithPaymentCard(flow: ValueOf<typeof CONST.DOMAIN.PAYMENT_CARD_FLOW>) {
    const [userBillingFundID] = useOnyx(ONYXKEYS.NVP_BILLING_FUND_ID);
    const hasPaymentCard = doesUserHavePaymentCardAdded(userBillingFundID);

    return (action: () => void) => {
        if (hasPaymentCard) {
            action();
            return;
        }
        Navigation.navigate(createDynamicRoute(DYNAMIC_ROUTES.DOMAIN_PAYMENT_CARD.getRoute(flow)));
    };
}

export default useRunWithPaymentCard;
