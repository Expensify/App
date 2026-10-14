import {createContext} from 'react';

type ScreenVisibilityStore = {
    /** As `getIsScreenVisible` decides it. */
    getIsVisible: () => boolean;
    subscribe: (onChange: () => void) => () => void;
};

/** Nothing covers a tree rendered outside a screen. */
const ALWAYS_VISIBLE: ScreenVisibilityStore = {getIsVisible: () => true, subscribe: () => () => {}};

/** A store rather than a value, so rows reading it don't all re-render when the screen is covered or uncovered. */
const ScreenVisibilityContext = createContext<ScreenVisibilityStore>(ALWAYS_VISIBLE);

/** The screen's visibility in the render that computes it, which the store only publishes after that render. */
const ScreenVisibleInRenderContext = createContext(true);

export default ScreenVisibilityContext;
export {ScreenVisibleInRenderContext};
export type {ScreenVisibilityStore};
