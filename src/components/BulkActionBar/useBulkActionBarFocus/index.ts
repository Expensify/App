import isHTMLElement from '@libs/isHTMLElement';
import markProgrammaticFocus from '@libs/programmaticFocus';
import restoreFocusWithModality from '@libs/restoreFocusWithModality';

import {useEffect, useLayoutEffect, useRef, useState} from 'react';

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

/** Tracks where focus is relative to the bar, and hands it back when the bar goes away holding it. */
const useBulkActionBarFocus: UseBulkActionBarFocus = (barRef, isCoveredByOverlay) => {
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

            // The role screen and the bar's own "More" menu both take focus to controls that leave with them, and the
            // menu renders in a popover outside the bar rather than within it. Remembering either would leave the bar
            // holding a target that is already gone when it needs one.
            if (isCoveredByOverlay) {
                return;
            }

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
    }, [barRef, isCoveredByOverlay]);

    // Most of the bar's actions clear the selection themselves, so the bar is torn out from under the button that was
    // just pressed and focus would fall to the document. Handing it back here covers every one of those actions,
    // rather than only the two the bar runs itself. A layout cleanup rather than a passive one, because this has to
    // read the focus before the bar leaves the DOM.
    useLayoutEffect(
        () => () => {
            const bar = barRef.current;
            const active = document.activeElement;

            // An action run from a screen opened over the table clears the selection from there, so the bar is gone
            // before that screen hands its own focus back and there is nothing left for it to hand back to. Focus has
            // already fallen to the document by then, which is the same loss as the bar being torn out from under it.
            const hasFocusFallenToDocument = !active || active === document.body;
            if (!hasFocusFallenToDocument && !(isHTMLElement(bar) && bar.contains(active))) {
                return;
            }

            const previous = lastFocusedOutsideRef.current;
            if (!previous?.isConnected) {
                return;
            }

            // The screen that cleared the selection may still be unwinding its focus trap, which would otherwise pull
            // focus straight back into the container it is closing.
            restoreFocusWithModality(previous);
        },
        [barRef],
    );

    const suppressStrayFocusRing = () => {
        const active = document.activeElement;
        if (!isHTMLElement(active)) {
            return;
        }

        const bar = barRef.current;
        if (isHTMLElement(bar) && bar.contains(active)) {
            return;
        }

        // Esc makes whatever holds focus match `:focus-visible`, so a checkbox clicked with the mouse would light up
        // with a focus ring just as the selection it belongs to disappears.
        if (isShowingFocusRing(active)) {
            return;
        }

        markProgrammaticFocus(active);
    };

    return {suppressStrayFocusRing, isFocusInsideBar};
};

export default useBulkActionBarFocus;
