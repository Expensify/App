import {useEffect} from 'react';
import FOCUSABLE_SELECTOR from '@libs/focusableSelector';
import isHTMLElement from '@libs/isHTMLElement';
import markProgrammaticFocus from '@libs/programmaticFocus';
import {Priorities, resetCycle, tryClaim} from '@libs/ScreenFocusArbiter';
import type UseAccessibilityFocus from './type';

const useAccessibilityFocus: UseAccessibilityFocus = ({didScreenTransitionEnd, isFocused, ref, shouldMoveAccessibilityFocus}) => {
    useEffect(() => {
        if (!shouldMoveAccessibilityFocus || !didScreenTransitionEnd || !isFocused) {
            return;
        }

        if (typeof document === 'undefined') {
            return;
        }

        const element = ref.current;
        if (!isHTMLElement(element)) {
            return;
        }

        const activeElement = document.activeElement;
        if (activeElement && element.contains(activeElement)) {
            return;
        }

        if (!tryClaim(Priorities.AUTO)) {
            return;
        }

        // Release after the focus call so a same-tree sub-modal's INITIAL claim isn't blocked when no nav state change runs handleStateChange's resetCycle.
        try {
            const focusTargets = element.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR);
            for (const focusTarget of focusTargets) {
                const isDisabledTarget = focusTarget.matches(':disabled') || focusTarget.getAttribute('aria-disabled') === 'true';
                if (isDisabledTarget || focusTarget.getAttribute('aria-hidden') === 'true') {
                    continue;
                }

                if (focusTarget === activeElement) {
                    return;
                }

                const unmarkProgrammaticFocus = markProgrammaticFocus(focusTarget);
                focusTarget.focus();

                const focusedElement = document.activeElement;
                if (focusedElement === focusTarget || (focusedElement && focusTarget.contains(focusedElement))) {
                    return;
                }

                unmarkProgrammaticFocus();
            }
        } finally {
            resetCycle();
        }
    }, [didScreenTransitionEnd, isFocused, ref, shouldMoveAccessibilityFocus]);
};

export default useAccessibilityFocus;
