import FOCUSABLE_SELECTOR from '@libs/focusableSelector';
import isHTMLElement from '@libs/isHTMLElement';
import Log from '@libs/Log';
import markProgrammaticFocus from '@libs/programmaticFocus';
import {Priorities, resetCycle, tryClaim} from '@libs/ScreenFocusArbiter';

import {useEffect} from 'react';

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

        // try/catch (RC rejects bare try/finally) so a stale-node throw still releases the AUTO cycle; log+swallow keeps a transient DOM throw out of React's error path.
        try {
            const focusTargets = element.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR);
            for (const focusTarget of focusTargets) {
                const isDisabledTarget = focusTarget.matches(':disabled') || focusTarget.getAttribute('aria-disabled') === 'true';
                if (isDisabledTarget || focusTarget.getAttribute('aria-hidden') === 'true') {
                    continue;
                }

                if (focusTarget === activeElement) {
                    break;
                }

                const unmarkProgrammaticFocus = markProgrammaticFocus(focusTarget);
                let focusThrew = false;
                try {
                    focusTarget.focus();
                } catch (focusError) {
                    focusThrew = true;
                    Log.warn('[useAccessibilityFocus] focus call threw', {error: focusError});
                }
                if (focusThrew) {
                    unmarkProgrammaticFocus();
                    break;
                }

                const focusedElement = document.activeElement;
                if (focusedElement === focusTarget || (focusedElement && focusTarget.contains(focusedElement))) {
                    break;
                }

                unmarkProgrammaticFocus();
            }
        } catch (error) {
            Log.warn('[useAccessibilityFocus] focus walk threw', {error});
        }
        resetCycle();
    }, [didScreenTransitionEnd, isFocused, ref, shouldMoveAccessibilityFocus]);
};

export default useAccessibilityFocus;
