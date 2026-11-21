/**
 * Lets a menu rendered inside a peeking surface keep the peek open while it shows and settle the peek once it closes,
 * without the surface's rows knowing about the peek.
 */
import {createContext} from 'react';

type PeekSurfaceContextValue = {
    /** Keeps the peek open until the matching release, because the menu opens partly outside the surface. Calls nest, so several menus can hold at once. */
    holdPeek: () => void;

    /**
     * Drops one hold, and ends the peek if nothing else holds it, the pointer is not over the surface and the user is not on the keyboard.
     * A menu calls this once its popover is gone, because the popover is portaled outside the surface and taking it away sends no hover-out to the surface.
     */
    releasePeek: () => void;
};

// Outside a peeking surface there is no peek to hold, so menus there behave as they always did.
const PeekSurfaceContext = createContext<PeekSurfaceContextValue>({
    holdPeek: () => {},
    releasePeek: () => {},
});

export default PeekSurfaceContext;
export type {PeekSurfaceContextValue};
