import type {PaymentMethod} from '@components/KYCWall/types';
import type {PaymentMethodType} from './OriginalMessage';

/**
 * Captures a payment action that was interrupted because the user's account was not yet validated.
 *
 * When an unvalidated user presses a Pay button, the originating component stores this intent and
 * sends the user through the verify-account flow. Once the account is validated, the same Pay button
 * picks the intent back up and resumes the exact KYC/payment action (see `useResumePaymentAfterValidation`),
 * instead of dropping the user on a static page.
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
