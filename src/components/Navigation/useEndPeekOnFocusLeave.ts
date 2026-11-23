/**
 * Ends the peek of a collapsed surface once keyboard focus that held it open lands elsewhere. After the pointer leaves the surface over a menu's
 * backdrop, no hover-out reaches the surface, so a Tab out of it or a click on the page, which focuses the page's container, ends the peek instead.
 */
import isHTMLElement from '@libs/isHTMLElement';

import type {RefObject} from 'react';
import type {NativeSyntheticEvent, TargetedEvent} from 'react-native';

import {useEffect, useRef} from 'react';

function useEndPeekOnFocusLeave(surfaceRef: RefObject<HTMLElement | null>, isPeeking: boolean, endPeek: () => void) {
    const lastFocusInsideRef = useRef<unknown>(null);

    useEffect(() => {
        const element = surfaceRef.current;
        if (!isPeeking || !isHTMLElement(element)) {
            return;
        }
        const endPeekIfFocusLeft = (event: FocusEvent) => {
            if (event.target === lastFocusInsideRef.current || element.matches(':hover')) {
                return;
            }
            endPeek();
        };
        document.addEventListener('focusin', endPeekIfFocusLeft);
        return () => document.removeEventListener('focusin', endPeekIfFocusLeft);
    }, [endPeek, isPeeking, surfaceRef]);

    // The surface's menus render in a portal outside the surface's DOM, so focus inside them cannot be read from the DOM.
    // React sends a focus event up through portals before the focusin reaches the document, so this records focus in the surface or its menus.
    const saveFocusInside = (event: NativeSyntheticEvent<TargetedEvent>) => {
        lastFocusInsideRef.current = event.nativeEvent.target;
    };

    return saveFocusInside;
}

export default useEndPeekOnFocusLeave;
