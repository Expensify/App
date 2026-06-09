import Onyx from 'react-native-onyx';
import ONYXKEYS from '@src/ONYXKEYS';
import type PendingPaymentContinue from '@src/types/onyx/PendingPaymentContinue';

/**
 * Stores a payment action that was interrupted because the user's account is not yet validated, so the
 * originating Pay button can resume it after verification. See `useResumePaymentAfterValidation`.
 */
function setPendingPaymentContinue(intent: PendingPaymentContinue) {
    Onyx.set(ONYXKEYS.PENDING_PAYMENT_CONTINUE, intent);
}

/** Clears the pending payment intent once it has been resumed (or abandoned). */
function clearPendingPaymentContinue() {
    Onyx.set(ONYXKEYS.PENDING_PAYMENT_CONTINUE, null);
}

export {setPendingPaymentContinue, clearPendingPaymentContinue};
