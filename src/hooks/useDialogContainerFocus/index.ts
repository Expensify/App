import {useEffect} from 'react';
import type UseDialogContainerFocus from './types';

/**
 * Focuses the dialog heading when the screen transition completes.
 * Only fires for the first screen in the RHP (claimInitialFocus returns true once).
 * Inner navigation screens (e.g. Name, Type) skip this so input fields keep focus.
 * If an interactive element (input/textarea/select) already has focus, the heading
 * focus is skipped so the screen's auto-focus is preserved.
 */
const useDialogContainerFocus: UseDialogContainerFocus = (ref, isReady, claimInitialFocus) => {
    useEffect(() => {
        if (!isReady || !claimInitialFocus?.()) {
            return;
        }
        const active = document.activeElement;
        if (active instanceof HTMLInputElement || active instanceof HTMLTextAreaElement || active instanceof HTMLSelectElement) {
            return;
        }
        (ref.current as unknown as HTMLElement)?.focus();
    }, [isReady, ref, claimInitialFocus]);
};

export default useDialogContainerFocus;
