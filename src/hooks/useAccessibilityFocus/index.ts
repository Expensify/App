import {useEffect} from 'react';
import focusElementProgrammatically, {isHTMLElement} from '@libs/focusUtils/focusElementProgrammatically';
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

            if (focusElementProgrammatically(focusTarget)) {
                return;
            }
        }
    }, [didScreenTransitionEnd, isFocused, ref, shouldMoveAccessibilityFocus]);
};

export default useAccessibilityFocus;
