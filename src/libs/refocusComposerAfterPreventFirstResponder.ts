import isWindowReadyToFocus from './isWindowReadyToFocus';
import type {ComposerType} from './ReportActionComposeFocusManager';
import ReportActionComposeFocusManager from './ReportActionComposeFocusManager';

function refocusComposerAfterPreventFirstResponder(composerToRefocusOnClose: ComposerType | undefined) {
    return isWindowReadyToFocus().then(() => {
        if (composerToRefocusOnClose === 'main') {
            ReportActionComposeFocusManager.composerRef.current?.focus();
        } else if (composerToRefocusOnClose === 'edit') {
            ReportActionComposeFocusManager.editComposerRef.current?.focus();
        }
    });
}

export default refocusComposerAfterPreventFirstResponder;
