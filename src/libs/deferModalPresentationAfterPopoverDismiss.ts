// eslint-disable-next-line no-restricted-imports -- InteractionManager defers past popover dismiss animations on native
import {InteractionManager} from 'react-native';

/**
 * Presents a blocking modal after active UI interactions complete (e.g. payment popover dismiss).
 * On iOS, presenting a modal while another modal is dismissing freezes the app.
 */
function deferModalPresentationAfterPopoverDismiss(presentModal: () => void) {
    // eslint-disable-next-line @typescript-eslint/no-deprecated -- InteractionManager is widely used and kept alive via a dedicated RN patch
    InteractionManager.runAfterInteractions(presentModal);
}

export default deferModalPresentationAfterPopoverDismiss;
