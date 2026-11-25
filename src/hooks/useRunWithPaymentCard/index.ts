import useOnyx from '@hooks/useOnyx';

import createDynamicRoute from '@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute';
import Navigation from '@libs/Navigation/Navigation';
import {doesUserHavePaymentCardAdded} from '@libs/SubscriptionUtils';

import ONYXKEYS from '@src/ONYXKEYS';
import {DYNAMIC_ROUTES} from '@src/ROUTES';

import {useIsFocused} from '@react-navigation/native';
import {useEffect, useRef} from 'react';

/**
 * Returns a function that runs an action which charges the user's payment card. Without a card, it opens the add
 * payment card flow first and runs the action when the user comes back with one.
 */
function useRunWithPaymentCard() {
    const isFocused = useIsFocused();
    const [userBillingFundID] = useOnyx(ONYXKEYS.NVP_BILLING_FUND_ID);
    const hasPaymentCard = doesUserHavePaymentCardAdded(userBillingFundID);
    const pendingActionRef = useRef<() => void>(undefined);

    // The screen regains focus when the add payment card flow closes, whether or not the user added a card.
    useEffect(() => {
        const pendingAction = pendingActionRef.current;
        if (!isFocused || !pendingAction) {
            return;
        }
        pendingActionRef.current = undefined;
        if (!hasPaymentCard) {
            return;
        }
        pendingAction();
    }, [isFocused, hasPaymentCard]);

    return (action: () => void) => {
        if (hasPaymentCard) {
            action();
            return;
        }
        pendingActionRef.current = action;
        Navigation.navigate(createDynamicRoute(DYNAMIC_ROUTES.ADD_PAYMENT_CARD.path));
    };
}

export default useRunWithPaymentCard;
