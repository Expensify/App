import {useEffect} from 'react';
import claimInitialFocus from '@libs/claimInitialFocus';
import FOCUSABLE_SELECTOR from '@libs/focusableSelector';
import hasFocusableAttributes from '@libs/focusGuards';
import getHadTabNavigation from '@libs/hadTabNavigation';
import isHTMLElement from '@libs/isHTMLElement';
import TransitionTracker from '@libs/Navigation/TransitionTracker';
import type UseDialogContainerFocus from './types';

function focusFirstInteractiveElement(container: HTMLElement | null): boolean {
    // RHP initial focus is keyboard-only, so the ring is always shown (WCAG 2.4.7).
    if (!getHadTabNavigation() || !container) {
        return false;
    }
    const targets = container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR);
    const target = Array.from(targets).find(hasFocusableAttributes);
    if (!target) {
        return false;
    }
    return claimInitialFocus(target, {focusVisible: true});
}

/** Focuses the first interactive element inside the dialog after the RHP transition for screen reader announcement. */
const useDialogContainerFocus: UseDialogContainerFocus = (ref, isReady, claimInitialFocusGate, skipDialogContainerFocus = false) => {
    useEffect(() => {
        if (!isReady || !claimInitialFocusGate?.() || skipDialogContainerFocus) {
            return;
        }
        let rafId: number | null = null;
        const handle = TransitionTracker.runAfterTransitions({
            callback: () => {
                // runAfterTransitions fires synchronously when no transition is active; defer one frame so late-mounted RHP content is queryable.
                rafId = requestAnimationFrame(() => {
                    const container = isHTMLElement(ref.current) ? ref.current : null;
                    focusFirstInteractiveElement(container);
                });
            },
        });
        return () => {
            handle.cancel();
            if (rafId !== null) {
                cancelAnimationFrame(rafId);
            }
        };
    }, [isReady, ref, claimInitialFocusGate, skipDialogContainerFocus]);
};

export default useDialogContainerFocus;
export {focusFirstInteractiveElement};
