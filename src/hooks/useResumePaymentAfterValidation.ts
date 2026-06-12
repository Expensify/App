import {useEffect} from 'react';
import {clearPendingPaymentContinue} from '@libs/actions/PendingPaymentContinue';
import setNavigationActionToMicrotaskQueue from '@libs/Navigation/helpers/setNavigationActionToMicrotaskQueue';
// eslint-disable-next-line no-restricted-imports -- the hook does not use React Navigation directly but 'resume' callback can contain navigation
import TransitionTracker from '@libs/Navigation/TransitionTracker';
import ONYXKEYS from '@src/ONYXKEYS';
import type PendingPaymentContinue from '@src/types/onyx/PendingPaymentContinue';
import useOnyx from './useOnyx';

/**
 * Wires up resume-after-verification for a Pay button.
 *
 * Usage: when an unvalidated user presses Pay, store the attempted payment with `setPendingPaymentContinue(intent)`
 * before routing them to the verify-account flow. Once the account is validated, this hook runs the original payment via `resume`.
 *
 * @param reportID - The report this Pay button belongs to; resume only fires for a matching stored intent.
 * @param resume - Re-invokes the original payment selection with the stored intent.
 */
function useResumePaymentAfterValidation(reportID: string | undefined, resume: (intent: PendingPaymentContinue) => void) {
    const [account] = useOnyx(ONYXKEYS.ACCOUNT);
    const [pendingPaymentContinue] = useOnyx(ONYXKEYS.PENDING_PAYMENT_CONTINUE);

    const isValidated = account?.validated ?? false;

    useEffect(() => {
        if (!isValidated || !pendingPaymentContinue || !reportID || pendingPaymentContinue.reportID !== reportID) {
            return;
        }

        // Clear first so the resume runs exactly once, even across re-renders.
        clearPendingPaymentContinue();
        TransitionTracker.runAfterTransitions({
            callback: () => resume(pendingPaymentContinue),
            waitForUpcomingTransition: true,
        });
    }, [isValidated, pendingPaymentContinue, reportID, resume]);
}

export default useResumePaymentAfterValidation;
