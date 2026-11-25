/**
 * Ends the peek of a collapsed surface once keyboard focus that held it open lands elsewhere. After the pointer leaves the surface over a menu's
 * backdrop, no hover-out reaches the surface, so a Tab out of it or a click on the page, which focuses the page's container, ends the peek instead.
 */
import {useEffect} from 'react';

import type UseEndPeekOnFocusLeave from './types';

const useEndPeekOnFocusLeave: UseEndPeekOnFocusLeave = (surfaceRef, isPeeking, endPeek) => {
    useEffect(() => {
        const element = surfaceRef.current;
        if (!isPeeking || !element) {
            return;
        }
        // An open menu renders in a portal outside the surface's DOM, so focus inside it reads as outside the surface. The surface passes an endPeek that keeps
        // the peek while a menu holds it, and once the menu is gone focus goes back to the menu's button inside the surface.
        const endPeekIfFocusLeft = (event: FocusEvent) => {
            if ((event.target instanceof Node && element.contains(event.target)) || element.matches(':hover')) {
                return;
            }
            endPeek();
        };
        document.addEventListener('focusin', endPeekIfFocusLeft);
        return () => document.removeEventListener('focusin', endPeekIfFocusLeft);
    }, [endPeek, isPeeking, surfaceRef]);
};

export default useEndPeekOnFocusLeave;
