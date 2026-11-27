import type CONST from '@src/CONST';

import type {ValueOf} from 'type-fest';

type PaymentCardFlow = ValueOf<typeof CONST.DOMAIN.PAYMENT_CARD_FLOW>;

type RunWithPaymentCard = {
    /** Whether the user has a payment card */
    hasPaymentCard: boolean;

    /** Whether the user can add a payment card on this platform */
    canAddPaymentCard: boolean;

    /** Runs a domain change for the given flow that charges the user's payment card, or asks for a card first */
    runWithPaymentCard: (flow: PaymentCardFlow, action: () => void) => void;

    /** Explains that the change for the given flow needs a payment card, which the user can't add on this platform */
    showNoPaymentCardModal: (flow: PaymentCardFlow) => void;
};

export default RunWithPaymentCard;
export type {PaymentCardFlow};
