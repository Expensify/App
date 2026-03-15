import {useEffect} from 'react';
import type UseDialogContainerFocus from './types';

const FORM_INPUT_SELECTOR = 'input:not([type="hidden"]), textarea, select';

function hasVisibleFormInput(heading: HTMLElement): boolean {
    const dialog = heading.closest('[role="dialog"]');
    if (!dialog) {
        return false;
    }
    return Array.from(dialog.querySelectorAll(FORM_INPUT_SELECTOR)).some((el) => !el.closest('[aria-hidden="true"]'));
}

/** Moves focus to the dialog heading after the RHP transition, unless another element already has focus. */
const useDialogContainerFocus: UseDialogContainerFocus = (ref, isReady, claimInitialFocus) => {
    useEffect(() => {
        if (!isReady || !claimInitialFocus?.()) {
            return;
        }
        const frameId = requestAnimationFrame(() => {
            if (document.activeElement && document.activeElement !== document.body) {
                return;
            }
            const heading = ref.current as unknown as HTMLElement | null;
            if (!heading || hasVisibleFormInput(heading)) {
                return;
            }
            heading.focus();
        });
        return () => cancelAnimationFrame(frameId);
    }, [isReady, ref, claimInitialFocus]);
};

export default useDialogContainerFocus;
