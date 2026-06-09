import {useCallback, useEffect} from 'react';
import {InteractionManager} from 'react-native';
import {clearPendingPaymentContinue, setPendingPaymentContinue} from '@libs/actions/PendingPaymentContinue';
import createDynamicRoute from '@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute';
import Navigation from '@libs/Navigation/Navigation';
// eslint-disable-next-line no-restricted-imports -- the hook does not use React Navigation directly but it's resume can contain navigation
import TransitionTracker from '@libs/Navigation/TransitionTracker';
import ONYXKEYS from '@src/ONYXKEYS';
import {DYNAMIC_ROUTES} from '@src/ROUTES';
import type PendingPaymentContinue from '@src/types/onyx/PendingPaymentContinue';
import useOnyx from './useOnyx';

/** The selection a Pay button stores when an unvalidated user is sent to verify their account (reportID is injected by the hook). */
type PendingPaymentSelection = Omit<PendingPaymentContinue, 'reportID'>;

/**
 * Wires up resume-after-verification for a Pay button and returns the callback to record an interrupted payment.
 *
 * Usage: when an unvalidated user presses Pay, call the returned `storePendingPayment(selection)` before routing
 * them to the verify-account flow. Once the account is validated, this hook re-runs the original payment via
 * `resume`, so the KYC wall makes the same decision it would have for an already-validated user (pay directly,
 * add a bank account, open the payment menu, etc.). The stored intent is cleared first so resume fires once.
 *
 * This is the callback-based counterpart to the static `FORWARD_TO_MAPPINGS` forward navigation: payment
 * continuation is a stateful action, not a fixed destination, so it cannot be expressed as a route.
 *
 * @param reportID - The report this Pay button belongs to; resume only fires for a matching stored intent.
 * @param resume - Re-invokes the original payment selection with the stored intent.
 * @returns `redirectToAccountVerification` - Records the interrupted payment (if any) and routes the user to the verify-account flow.
 */
function useResumePaymentAfterValidation(reportID: string | undefined, resume: (intent: PendingPaymentContinue) => void) {
    const [account] = useOnyx(ONYXKEYS.ACCOUNT);
    const [pendingPaymentContinue] = useOnyx(ONYXKEYS.PENDING_PAYMENT_CONTINUE);

    const isValidated = account?.validated ?? false;

    // `resume` is an inline closure at the call site; React Compiler memoizes it, so listing it as a dependency
    // is safe and avoids writing to a ref during render (a rules-of-react violation the compiler flags).
    useEffect(() => {
        if (!isValidated || !pendingPaymentContinue || !reportID || pendingPaymentContinue.reportID !== reportID) {
            return;
        }
        // Clear first so the resume runs exactly once, even across re-renders.
        clearPendingPaymentContinue();
        // InteractionManager.runAfterInteractions(() => resume(pendingPaymentContinue));
        TransitionTracker.runAfterTransitions({
            callback: () => setTimeout(() => resume(pendingPaymentContinue), 500),
            waitForUpcomingTransition: true,
        });
    }, [isValidated, pendingPaymentContinue, reportID, resume]);

    return useCallback(
        (selection?: PendingPaymentSelection) => {
            // Remember the payment the user was attempting so it can resume once the account is validated,
            // instead of forwarding them to a static page that can't reproduce the KYC wall's decision.
            if (reportID && selection) {
                setPendingPaymentContinue({reportID, ...selection});
            }
            Navigation.navigate(createDynamicRoute(DYNAMIC_ROUTES.VERIFY_ACCOUNT.path));
        },
        [reportID],
    );
}

export default useResumePaymentAfterValidation;
export type {PendingPaymentSelection};
