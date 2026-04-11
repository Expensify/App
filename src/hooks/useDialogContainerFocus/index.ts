import {useEffect} from 'react';
import {InteractionManager} from 'react-native';
import type UseDialogContainerFocus from './types';

const FOCUSABLE_SELECTOR = 'button, [href], input, textarea, select, [role="button"], [role="link"], [tabindex]:not([tabindex="-1"])';

// Tracks whether the user is Tab-navigating (vs typing in a form or using mouse).
// Tab sets it, typing keys clear it, Enter/Space preserve it, mousedown clears it.
let hadTabNavigation = false;
if (typeof document !== 'undefined') {
    document.addEventListener(
        'keydown',
        (e: KeyboardEvent) => {
            if (e.key === 'Tab') {
                hadTabNavigation = true;
            } else if (e.key !== 'Enter' && e.key !== ' ') {
                hadTabNavigation = false;
            }
        },
        true,
    );
    document.addEventListener(
        'mousedown',
        () => {
            hadTabNavigation = false;
        },
        true,
    );
}

/** @returns true if an element was focused, false otherwise. */
function focusFirstInteractiveElement(container: HTMLElement | null): boolean {
    if (!hadTabNavigation || !container || (document.activeElement && document.activeElement !== document.body)) {
        return false;
    }
    const targets = container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR);
    const target = Array.from(targets).find((el) => !el.closest('[aria-hidden="true"]') && !el.matches(':disabled') && el.getAttribute('aria-disabled') !== 'true');
    if (!target) {
        return false;
    }
    target.focus({preventScroll: true, focusVisible: true} as FocusOptions);
    return true;
}

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
                if (cancelled) {
                    return;
                }
                const container = ref.current as unknown as HTMLElement | null;
                focusFirstInteractiveElement(container);
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
export {focusFirstInteractiveElement, FOCUSABLE_SELECTOR};
