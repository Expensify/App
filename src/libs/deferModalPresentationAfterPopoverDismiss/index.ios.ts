import TransitionTracker from '@libs/Navigation/TransitionTracker';

/**
 * Presents a blocking modal after the payment popover dismisses.
 * On iOS, presenting a modal while another modal is dismissing freezes the app.
 */
function deferModalPresentationAfterPopoverDismiss(presentModal: () => void) {
    TransitionTracker.runAfterTransitions({
        callback: presentModal,
        waitForUpcomingTransition: true,
    });
}

export default deferModalPresentationAfterPopoverDismiss;
