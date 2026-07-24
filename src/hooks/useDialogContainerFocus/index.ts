import Accessibility from '@libs/Accessibility';
import claimInitialFocus, {claimDialogFocus} from '@libs/claimInitialFocus';
import hasHoverSupport from '@libs/DeviceCapabilities/hasHoverSupport';
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
 * Focus gate matches {@link useScreenInitialFocus}: skip only for hover-capable + never-tabbed + SR known-off
 * (mouse-open must not focus Back, or Enter closes the RHP). Tab users and screen-reader users (including
 * JAWS virtual cursor without prior Tab) still steal focus via claimDialogFocus. If focus is already inside
 * the dialog, leave it alone.
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
        // Same gate as useScreenInitialFocus — mouse without SR must not land on Back.
        if (hasHoverSupport() && !getHadTabNavigation() && Accessibility.getScreenReaderState() === 'disabled') {
            return false;
        }
        const focusTarget = target ?? container;
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
