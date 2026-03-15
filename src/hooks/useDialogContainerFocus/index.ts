import {useEffect} from 'react';
import type UseDialogContainerFocus from './types';

/** Moves focus to the dialog heading after the RHP transition, unless an input already has focus. */
const useDialogContainerFocus: UseDialogContainerFocus = (ref, isReady, claimInitialFocus) => {
    useEffect(() => {
        if (!isReady || !claimInitialFocus?.()) {
            return;
        }
        // Deferred so useAutoFocusInput can focus its input before we check activeElement.
        const frameId = requestAnimationFrame(() => {
            const active = document.activeElement;
            if (active instanceof HTMLInputElement || active instanceof HTMLTextAreaElement || active instanceof HTMLSelectElement) {
                return;
            }
            (ref.current as unknown as HTMLElement)?.focus();
        });
        return () => cancelAnimationFrame(frameId);
    }, [isReady, ref, claimInitialFocus]);
};

export default useDialogContainerFocus;
