import {useEffect} from 'react';
import type UseDialogContainerFocus from './types';

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
            (ref.current as unknown as HTMLElement)?.focus();
        });
        return () => cancelAnimationFrame(frameId);
    }, [isReady, ref, claimInitialFocus]);
};

export default useDialogContainerFocus;
