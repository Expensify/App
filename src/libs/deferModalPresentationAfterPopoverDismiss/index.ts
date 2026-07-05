/**
 * Presents a blocking modal after the payment popover dismisses.
 */
function deferModalPresentationAfterPopoverDismiss(presentModal: () => void) {
    presentModal();
}

export default deferModalPresentationAfterPopoverDismiss;
