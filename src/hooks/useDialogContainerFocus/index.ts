import {useEffect} from 'react';
import {InteractionManager} from 'react-native';
import type UseDialogContainerFocus from './types';

const FOCUSABLE_SELECTOR = 'button, [href], input, textarea, select, [role="button"], [role="link"], [tabindex]:not([tabindex="-1"])';

/** Focuses the first interactive element inside the dialog after the RHP transition for screen reader announcement. */
const useDialogContainerFocus: UseDialogContainerFocus = (ref, isReady, claimInitialFocus) => {
    useEffect(() => {
        if (!isReady || !claimInitialFocus?.()) {
            return;
        }
        let cancelled = false;
        let frameId: number;
        // Deferred past useAutoFocusInput's InteractionManager + Promise chain.
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        const interactionHandle = InteractionManager.runAfterInteractions(() => {
            if (cancelled) {
                return;
            }
            frameId = requestAnimationFrame(() => {
                if (cancelled || (document.activeElement && document.activeElement !== document.body)) {
                    return;
                }
                const container = ref.current as unknown as HTMLElement | null;
                const targets = container?.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR);
                const target = targets && Array.from(targets).find((el) => !el.closest('[aria-hidden="true"]'));
                target?.focus({preventScroll: true});
            });
        });
        return () => {
            cancelled = true;
            interactionHandle.cancel();
            cancelAnimationFrame(frameId);
        };
    }, [isReady, ref, claimInitialFocus]);
};

export default useDialogContainerFocus;
