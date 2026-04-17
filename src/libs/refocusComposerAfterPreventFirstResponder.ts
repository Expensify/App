import type {ComposerRef} from '@components/Composer/types';
import focusComposerWithDelay from './focusComposerWithDelay';
import type {ComposerType} from './ReportActionComposeFocusManager';
import ReportActionComposeFocusManager from './ReportActionComposeFocusManager';

function refocusComposerAfterPreventFirstResponder(composerToRefocusOnClose: ComposerType | undefined) {
    let composerRef: ComposerRef | null = null;
    if (composerToRefocusOnClose === 'main') {
        composerRef = ReportActionComposeFocusManager.composerRef.current;
    } else if (composerToRefocusOnClose === 'edit') {
        composerRef = ReportActionComposeFocusManager.editComposerRef.current;
    }

    return focusComposerWithDelay(composerRef)(true);

    // return isWindowReadyToFocus().then(() => {
    //     composerRef?.focus();
    // });
}

export default refocusComposerAfterPreventFirstResponder;
