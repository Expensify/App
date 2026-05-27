import {useEffect} from 'react';
import isHTMLElement from '@libs/isHTMLElement';
import {markProgrammaticFocus} from '@libs/programmaticFocus';
import type UseAccessibilityFocus from './type';

const FOCUSABLE_ELEMENTS_SELECTOR = 'button, [href], [role="button"], [role="link"], [tabindex]:not([tabindex="-1"])';

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

        const focusTargets = element.querySelectorAll<HTMLElement>(FOCUSABLE_ELEMENTS_SELECTOR);
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
    }, [didScreenTransitionEnd, isFocused, ref, shouldMoveAccessibilityFocus]);
};

export default useAccessibilityFocus;
