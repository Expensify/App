import claimInitialFocus, {claimDialogFocus} from '@libs/claimInitialFocus';
import FOCUSABLE_SELECTOR from '@libs/focusableSelector';
import hasFocusableAttributes from '@libs/focusGuards';
import getHadTabNavigation from '@libs/hadTabNavigation';
import isHTMLElement from '@libs/isHTMLElement';
import TransitionTracker from '@libs/Navigation/TransitionTracker';

import {useEffect} from 'react';

import type UseDialogContainerFocus from './types';

/**
 * Moves focus into an open RHP after the transition.
 *
 * Dialog title/role are announced via aria-live (see Header) — not by focusing the heading — so JAWS/NVDA
 * get a clean "{title}, dialog" without nested "group / and N more items" chrome.
 *
 * Still steals focus from the activator into the first interactive control (APG modal). claimInitialFocus's
 * body-only gate would leave JAWS on the trigger and skip the panel entirely. If the user already moved
 * focus into the dialog (click/Tab), leave it alone.
 */
function focusFirstInteractiveElement(container: HTMLElement | null): boolean {
    if (!container) {
        return false;
    }

    const activeElement = document.activeElement;
    if (activeElement instanceof Node && container.contains(activeElement)) {
        return false;
    }

    const targets = container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR);
    const target = Array.from(targets).find(hasFocusableAttributes);

    if (container.getAttribute('role') === 'dialog') {
        const focusTarget = target ?? container;
        // No ring unless the user is already keyboard-navigating (WCAG 2.4.7).
        return claimDialogFocus(focusTarget, {focusVisible: getHadTabNavigation()});
    }

    // Non-dialog screens: keep keyboard-only initial focus.
    if (!getHadTabNavigation() || !target) {
        return false;
    }
    return claimInitialFocus(target, {focusVisible: true});
}

/** Moves focus into the RHP after the transition (dialog name is announced separately via aria-live). */
const useDialogContainerFocus: UseDialogContainerFocus = (ref, isReady, claimInitialFocusGate, skipDialogContainerFocus = false) => {
    useEffect(() => {
        if (!isReady || skipDialogContainerFocus || !claimInitialFocusGate?.()) {
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
