import useOnyx from '@hooks/useOnyx';
import useReopenAfterReturn from '@hooks/useReopenAfterReturn';

import createDynamicRoute from '@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute';
import Navigation from '@libs/Navigation/Navigation';
import {doesUserHavePaymentCardAdded} from '@libs/SubscriptionUtils';

import ONYXKEYS from '@src/ONYXKEYS';
import {DYNAMIC_ROUTES} from '@src/ROUTES';

import {isCardSetupCompleteSelector} from '@selectors/AddPaymentCardForm';
import {useEffect, useRef} from 'react';

/**
 * Returns a function that runs an action which charges the user's payment card. Without a card, it opens the add
 * payment card flow first and runs the action when the user comes back with one.
 */
function useRunWithPaymentCard() {
    const [userBillingFundID] = useOnyx(ONYXKEYS.NVP_BILLING_FUND_ID);
    const [isCardSetupComplete] = useOnyx(ONYXKEYS.FORMS.ADD_PAYMENT_CARD_FORM, {selector: isCardSetupCompleteSelector});
    const hasPaymentCard = doesUserHavePaymentCardAdded(userBillingFundID);
    const pendingActionRef = useRef<() => void>(undefined);
    const hasAddedCardRef = useRef(false);

    // Some cards are saved before the user verifies them, so only a finished card setup counts as adding a card.
    // The flow resets that flag as it closes, so it is recorded while the flow is still open.
    useEffect(() => {
        if (!isCardSetupComplete) {
            return;
        }
        hasAddedCardRef.current = true;
    }, [isCardSetupComplete]);

    const {setIsDeparting} = useReopenAfterReturn({
        onReturn: () => {
            const pendingAction = pendingActionRef.current;
            pendingActionRef.current = undefined;
            if (!hasAddedCardRef.current) {
                return;
            }
            pendingAction?.();
        },
    });

    return (action: () => void) => {
        if (hasPaymentCard) {
            action();
            return;
        }
        pendingActionRef.current = action;
        hasAddedCardRef.current = false;
        setIsDeparting(true);
        Navigation.navigate(createDynamicRoute(DYNAMIC_ROUTES.ADD_PAYMENT_CARD.path));
    };
}

export default useRunWithPaymentCard;
