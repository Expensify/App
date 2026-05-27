import {useEffect} from 'react';
import FOCUSABLE_SELECTOR from '@libs/focusableSelector';
import hasFocusableAttributes from '@libs/focusGuards';
import getHadTabNavigation from '@libs/hadTabNavigation';
import isHTMLElement from '@libs/isHTMLElement';
// eslint-disable-next-line no-restricted-imports -- sibling primitive to TransitionTracker; needs the exact transitionEnd signal.
import TransitionTracker from '@libs/Navigation/TransitionTracker';
import {Priorities, tryClaim} from '@libs/ScreenFocusArbiter';
import type UseDialogContainerFocus from './types';

function focusFirstInteractiveElement(container: HTMLElement | null): boolean {
    if (!getHadTabNavigation() || !container || (document.activeElement && document.activeElement !== document.body)) {
        return false;
    }
    const targets = container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR);
    const target = Array.from(targets).find(hasFocusableAttributes);
    if (!target) {
        return false;
    }
    // Arbitrated so a concurrent RETURN restore wins over this dialog's initial focus.
    if (!tryClaim(Priorities.INITIAL)) {
        return false;
    }
    target.focus({preventScroll: true, focusVisible: true});
    return true;
}

/** Focuses the first interactive element inside the dialog after the RHP transition for screen reader announcement. */
const useDialogContainerFocus: UseDialogContainerFocus = (ref, isReady, claimInitialFocus) => {
    useEffect(() => {
        if (!isReady || !claimInitialFocus?.()) {
            return;
        }
        const handle = TransitionTracker.runAfterTransitions({
            callback: () => {
                const container = isHTMLElement(ref.current) ? ref.current : null;
                focusFirstInteractiveElement(container);
            },
        });
        return () => handle.cancel();
    }, [isReady, ref, claimInitialFocus]);
};

export default useDialogContainerFocus;
export {focusFirstInteractiveElement};
