import useOnyx from '@hooks/useOnyx';

import createDynamicRoute from '@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute';
import Navigation from '@libs/Navigation/Navigation';
import {doesUserHavePaymentCardAdded} from '@libs/SubscriptionUtils';

import ONYXKEYS from '@src/ONYXKEYS';
import {DYNAMIC_ROUTES} from '@src/ROUTES';

import type RunWithPaymentCard from './types';

/**
 * Runs domain changes that charge the user's payment card. Without a card, it opens the domain payment card page,
 * which makes the change for the given flow once the card is added.
 */
function useRunWithPaymentCard(): RunWithPaymentCard {
    const [userBillingFundID] = useOnyx(ONYXKEYS.NVP_BILLING_FUND_ID);
    const hasPaymentCard = doesUserHavePaymentCardAdded(userBillingFundID);

    return {
        hasPaymentCard,
        canAddPaymentCard: true,
        runWithPaymentCard: (flow, action) => {
            if (hasPaymentCard) {
                action();
                return;
            }
            Navigation.navigate(createDynamicRoute(DYNAMIC_ROUTES.DOMAIN_PAYMENT_CARD.getRoute(flow)));
        },
        // Adding a payment card is available on web, so no change needs this modal.
        showNoPaymentCardModal: () => {},
    };
}

export default useRunWithPaymentCard;
