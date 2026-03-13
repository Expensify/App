import {useEffect} from 'react';
import type UseDialogContainerFocus from './types';

/** Moves focus to the dialog heading after the RHP transition, unless an input already has focus. */
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
