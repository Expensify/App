import useScreenShareRequestPrompt from '@hooks/useScreenShareRequestPrompt';
import useUpdateAppPrompt from '@hooks/useUpdateAppPrompt';

import React from 'react';

import LazyModalSlot from './LazyModalSlot';

const LazyProactiveAppReviewModalManager = React.lazy(() => import('./ProactiveAppReviewModalManager'));
const LazyTrialPaymentReminderModalManager = React.lazy(() => import('./TrialPaymentReminderModalManager'));

/**
 * Global modals and prompts that are held back until after startup, so their dependencies and Onyx subscriptions stay
 * out of the ManualAppStartup span. `GlobalModals` mounts this only once the idle callback has fired, which is what
 * defers the two prompt hooks below — `useOnyx` cannot skip subscribing, so the call site is the only place to defer.
 */
function DeferredGlobalModals() {
    // Only the top of the modal stack renders, so the hook whose effect runs last owns the prompt the user sees when
    // both are pending at once. Effects run in hook-call order, so the forced-update prompt has to stay last here.
    useScreenShareRequestPrompt();
    useUpdateAppPrompt();

    return (
        <>
            {/* Order matters. Both managers still render their own modals, and BaseModal hardcodes zIndex: 1 on every
                one of them, so DOM source order decides which is painted on top when they coincide. Each keeps its own
                slot so a chunk-load failure in one cannot tear down the other. */}
            <LazyModalSlot>
                <LazyProactiveAppReviewModalManager />
            </LazyModalSlot>
            <LazyModalSlot>
                <LazyTrialPaymentReminderModalManager />
            </LazyModalSlot>
        </>
    );
}

export default DeferredGlobalModals;
