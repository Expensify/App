import type {ValueOf} from 'type-fest';

import {createContext} from 'react';

/** Where a subtree sits relative to the horizontal safe area its screen keeps out of (see HorizontalSafeArea). */
const HORIZONTAL_SAFE_AREA_PLACEMENT = {
    /** No ancestor keeps out of it yet, so a HorizontalSafeArea here applies the insets. */
    OUTSIDE: 'outside',
    /** Right inside the screen's insets: a vertical scroll view here is the screen's own and may reach the screen edge through them (see useHorizontalSafeAreaBleed). */
    SCREEN: 'screen',
    /** Inside the screen's own scroll view, which reaches the screen edge: a horizontal scroll view here may reach it too. */
    SCREEN_SCROLL_CONTENT: 'screenScrollContent',
    /** Inside a box within the screen, like a scroll view or a modal: a scroll view here stays inside the box. */
    BOX: 'box',
} as const;

type HorizontalSafeAreaPlacement = ValueOf<typeof HORIZONTAL_SAFE_AREA_PLACEMENT>;

const HorizontalSafeAreaContext = createContext<HorizontalSafeAreaPlacement>(HORIZONTAL_SAFE_AREA_PLACEMENT.OUTSIDE);

export default HorizontalSafeAreaContext;
export {HORIZONTAL_SAFE_AREA_PLACEMENT};
export type {HorizontalSafeAreaPlacement};
