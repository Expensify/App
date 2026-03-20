import {useEffect} from 'react';
import type UseDialogContainerFocus from './types';

/** Focuses the dialog container after the RHP transition for screen reader announcement. */
const useDialogContainerFocus: UseDialogContainerFocus = (ref, isReady, claimInitialFocus) => {
    useEffect(() => {
        if (!isReady || !claimInitialFocus?.()) {
            return;
        }
        const frameId = requestAnimationFrame(() => {
            if (document.activeElement && document.activeElement !== document.body) {
                return;
            }
            const container = ref.current as unknown as HTMLElement | null;
            container?.focus({preventScroll: true});
        });
        return () => cancelAnimationFrame(frameId);
    }, [isReady, ref, claimInitialFocus]);
};

export default useDialogContainerFocus;
