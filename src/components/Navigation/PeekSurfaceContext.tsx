/**
 * Lets a menu rendered inside a peeking surface settle the peek once it closes, without the surface's rows knowing about the peek.
 */
import {createContext} from 'react';

type PeekSurfaceContextValue = {
    /**
     * Ends the peek unless the pointer is still over the surface or keyboard focus is inside it. A menu calls this once its popover is gone, because the popover
     * is portaled outside the surface and taking it away sends no hover-out to the surface.
     */
    endPeekIfPointerLeft: () => void;
};

// Outside a peeking surface there is no peek to end, so menus there behave as they always did.
const PeekSurfaceContext = createContext<PeekSurfaceContextValue>({
    endPeekIfPointerLeft: () => {},
});

export default PeekSurfaceContext;
export type {PeekSurfaceContextValue};
