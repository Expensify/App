import CONST from '@src/CONST';
import getPlatform from './getPlatform';
import TransitionTracker from './Navigation/TransitionTracker';

/**
 * Presents a blocking modal after the payment popover dismisses.
 * On iOS, presenting a modal while another modal is dismissing freezes the app.
 */
function deferModalPresentationAfterPopoverDismiss(presentModal: () => void) {
    if (getPlatform() !== CONST.PLATFORM.IOS) {
        presentModal();
        return;
    }

    TransitionTracker.runAfterTransitions({
        callback: presentModal,
        waitForUpcomingTransition: true,
    });
}

export default deferModalPresentationAfterPopoverDismiss;
