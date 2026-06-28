import type {PaymentMethod} from '@components/KYCWall/types';
import type {PaymentMethodType} from './OriginalMessage';

/**
 * Captures a payment action that was interrupted because the user's account was not yet validated.
 */
type PendingPaymentContinue = {
    /** ID of the report whose Pay button started the payment. Resume only fires for the matching button. */
    reportID: string;

    /** The payment type the user selected before being interrupted (e.g. Expensify / VBBA). */
    iouPaymentType: PaymentMethodType;

    /** The specific payment method that was selected, when applicable. */
    paymentMethod?: PaymentMethod;

    /** The policyID used for the payment, when paying via a workspace. */
    policyID?: string;
};

export default PendingPaymentContinue;
