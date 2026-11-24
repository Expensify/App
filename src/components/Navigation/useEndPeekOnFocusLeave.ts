/**
 * Ends the peek of a collapsed surface once keyboard focus that held it open lands elsewhere. After the pointer leaves the surface over a menu's
 * backdrop, no hover-out reaches the surface, so a Tab out of it or a click on the page, which focuses the page's container, ends the peek instead.
 */
import isHTMLElement from '@libs/isHTMLElement';

import type {RefObject} from 'react';

import {useEffect} from 'react';

function useEndPeekOnFocusLeave(surfaceRef: RefObject<HTMLElement | null>, isPeeking: boolean, endPeek: () => void, isMenuOpen: () => boolean) {
    useEffect(() => {
        const element = surfaceRef.current;
        if (!isPeeking || !isHTMLElement(element)) {
            return;
        }
        // An open menu renders in a portal outside the surface's DOM, so focus inside it reads as outside the surface. The menu holds the peek until it is gone,
        // and focus then goes back to the menu's button inside the surface.
        const endPeekIfFocusLeft = (event: FocusEvent) => {
            if (isMenuOpen() || (event.target instanceof Node && element.contains(event.target)) || element.matches(':hover')) {
                return;
            }
            endPeek();
        };
        document.addEventListener('focusin', endPeekIfFocusLeft);
        return () => document.removeEventListener('focusin', endPeekIfFocusLeft);
    }, [endPeek, isMenuOpen, isPeeking, surfaceRef]);
}

export default useEndPeekOnFocusLeave;
