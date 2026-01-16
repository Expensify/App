import ComposerFocusManager from './ComposerFocusManager';
import type {ComposerType} from './ComposerFocusManager';
import isWindowReadyToFocus from './isWindowReadyToFocus';

function refocusComposerAfterPreventFirstResponder(composerToRefocusOnClose: ComposerType | undefined) {
    return isWindowReadyToFocus().then(() => {
        if (composerToRefocusOnClose === 'main') {
            ComposerFocusManager.composerRef.current?.focus();
        } else if (composerToRefocusOnClose === 'edit') {
            ComposerFocusManager.editComposerRef.current?.focus();
        }
    });
}

export default refocusComposerAfterPreventFirstResponder;
