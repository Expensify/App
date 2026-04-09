import {useEffect} from 'react';
import {InteractionManager} from 'react-native';
import type UseDialogContainerFocus from './types';

const FOCUSABLE_SELECTOR = 'button, [href], input, textarea, select, [role="button"], [role="link"], [tabindex]:not([tabindex="-1"])';
const PROGRAMMATIC_FOCUS_DATA_ATTRIBUTE = 'data-programmatic-focus';

let hadKeyboardEvent = false;
if (typeof document !== 'undefined') {
    document.addEventListener(
        'keydown',
        () => {
            hadKeyboardEvent = true;
        },
        true,
    );
    document.addEventListener(
        'mousedown',
        () => {
            hadKeyboardEvent = false;
        },
        true,
    );
}

type CleanupFn = () => void;

/** @returns a cleanup function if an element was focused, or undefined otherwise. */
function focusFirstInteractiveElement(container: HTMLElement | null): CleanupFn | undefined {
    if (!container || (document.activeElement && document.activeElement !== document.body)) {
        return undefined;
    }
    const targets = container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR);
    const target = Array.from(targets).find((el) => !el.closest('[aria-hidden="true"]') && !el.matches(':disabled') && el.getAttribute('aria-disabled') !== 'true');
    if (!target) {
        return undefined;
    }
    let cleanupListener: CleanupFn | undefined;
    if (!hadKeyboardEvent) {
        // On first Tab, prevent default and re-focus the same element with a visible ring
        // so the user sees focus land here instead of advancing past the silent focus.
        const onFirstTab = (e: KeyboardEvent) => {
            if (e.key !== 'Tab' || document.activeElement !== target) {
                return;
            }
            e.preventDefault();
            document.removeEventListener('keydown', onFirstTab, true);
            target.removeAttribute(PROGRAMMATIC_FOCUS_DATA_ATTRIBUTE);
            target.style.removeProperty('outline');
            target.focus({preventScroll: true});
        };
        target.setAttribute(PROGRAMMATIC_FOCUS_DATA_ATTRIBUTE, 'true');
        target.style.setProperty('outline', 'none');
        // No blur cleanup — attributes must survive browser tab-switch blur/re-focus cycles.
        document.addEventListener('keydown', onFirstTab, true);
        cleanupListener = () => {
            document.removeEventListener('keydown', onFirstTab, true);
            target.removeAttribute(PROGRAMMATIC_FOCUS_DATA_ATTRIBUTE);
            target.style.removeProperty('outline');
        };
    }
    target.focus({preventScroll: true});
    return cleanupListener;
}

/** Focuses the first interactive element inside the dialog after the RHP transition for screen reader announcement. */
const useDialogContainerFocus: UseDialogContainerFocus = (ref, isReady, claimInitialFocus) => {
    useEffect(() => {
        if (!isReady || !claimInitialFocus?.()) {
            return;
        }
        let cancelled = false;
        let frameId: number;
        let focusCleanup: CleanupFn | undefined;
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
                focusCleanup = focusFirstInteractiveElement(container);
            });
        });
        return () => {
            cancelled = true;
            interactionHandle.cancel();
            cancelAnimationFrame(frameId);
            focusCleanup?.();
        };
    }, [isReady, ref, claimInitialFocus]);
};

export default useDialogContainerFocus;
export {focusFirstInteractiveElement, FOCUSABLE_SELECTOR};
