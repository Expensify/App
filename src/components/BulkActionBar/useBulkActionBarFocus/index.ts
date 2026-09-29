import isHTMLElement from '@libs/isHTMLElement';
import markProgrammaticFocus from '@libs/programmaticFocus';

import {useEffect, useRef, useState} from 'react';

import type UseBulkActionBarFocus from './types';

/**
 * Whether the browser is already drawing a focus ring on this element. Browsers that cannot be asked are assumed to be
 * drawing one, so a ring is never taken away from someone who navigated there with the keyboard.
 */
function isShowingFocusRing(element: HTMLElement): boolean {
    try {
        return element.matches(':focus-visible');
    } catch {
        return true;
    }
}

/** Tracks where focus is relative to the bar, and settles where it goes when the selection is cleared. */
const useBulkActionBarFocus: UseBulkActionBarFocus = (barRef) => {
    // Where focus was before the bar took it. The bar goes away with the selection, so focus has to be handed back.
    const lastFocusedOutsideRef = useRef<HTMLElement | null>(null);

    const [isFocusInsideBar, setIsFocusInsideBar] = useState(false);

    useEffect(() => {
        const handleFocusIn = (event: FocusEvent) => {
            const target = event.target;
            if (!isHTMLElement(target)) {
                return;
            }

            const bar = barRef.current;
            if (isHTMLElement(bar) && bar.contains(target)) {
                setIsFocusInsideBar(true);
                return;
            }

            setIsFocusInsideBar(false);
            lastFocusedOutsideRef.current = target;
        };

        // Focus can also leave for nothing at all, such as an element being removed, which fires no matching focusin.
        const handleFocusOut = (event: FocusEvent) => {
            if (event.relatedTarget) {
                return;
            }

            setIsFocusInsideBar(false);
        };

        document.addEventListener('focusin', handleFocusIn);
        document.addEventListener('focusout', handleFocusOut);

        return () => {
            document.removeEventListener('focusin', handleFocusIn);
            document.removeEventListener('focusout', handleFocusOut);
        };
    }, [barRef]);

    const handleFocusBeforeClose = () => {
        const active = document.activeElement;
        if (!isHTMLElement(active)) {
            return;
        }

        const bar = barRef.current;
        if (isHTMLElement(bar) && bar.contains(active)) {
            const previous = lastFocusedOutsideRef.current;
            if (!previous?.isConnected) {
                active.blur();
                return;
            }

            // Focus is being put back where the user left it rather than moved somewhere new, so it arrives without a ring.
            markProgrammaticFocus(previous);
            previous.focus();
            return;
        }

        // Esc makes whatever holds focus match `:focus-visible`, so a checkbox clicked with the mouse would light up
        // with a focus ring just as the selection it belongs to disappears.
        if (!isShowingFocusRing(active)) {
            markProgrammaticFocus(active);
        }
    };

    return {handleFocusBeforeClose, isFocusInsideBar};
};

export default useBulkActionBarFocus;
