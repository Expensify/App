/**
 * Holds a left-pinned Spend table cell in place while the table scrolls sideways. Where the browser supports scroll-driven animations
 * the scroller's timeline moves the cell on the compositor, in the same frame as the scroll. Elsewhere the scroller writes its
 * offset into a CSS custom property from its scroll handler, a frame behind, and the cell translates by it.
 */
import type React from 'react';
import type {ViewStyle} from 'react-native';

import {PINNED_KEYFRAMES, PINNED_SCROLL_TIMELINE, PINNED_SCROLL_X_VARIABLE} from './pinnedScrollVariables';

const canUseScrollTimeline = typeof CSS !== 'undefined' && CSS.supports('animation-timeline', 'scroll()');

/**
 * Runs the named keyframes against the scroller's timeline, from its start (0%) to its end (100%). A table that fits has no
 * scroller and so no timeline, which leaves the animation inactive and the element on its own styles.
 */
function getScrollTimelineAnimation(keyframes: string[]): React.CSSProperties {
    return {
        animationName: keyframes.join(', '),
        animationTimeline: keyframes.map(() => PINNED_SCROLL_TIMELINE).join(', '),
        animationDuration: 'auto',
        animationTimingFunction: 'linear',
        animationFillMode: 'both',
    };
}

/** Without a scroll timeline, follows the offset the scroll handler writes. */
const SCROLL_X_TRANSLATE: React.CSSProperties = {transform: `translateX(var(${PINNED_SCROLL_X_VARIABLE}, 0px))`};

const START_TRANSLATE: React.CSSProperties = canUseScrollTimeline ? getScrollTimelineAnimation([PINNED_KEYFRAMES.START_TRANSLATE]) : SCROLL_X_TRANSLATE;

// Above the row's cover, which sits above the cells scrolling beneath it.
// eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- RN-web passes the animation properties through, which the native types don't model.
const PINNED_START_CELL_STYLE = {...START_TRANSLATE, zIndex: 2} as ViewStyle;

// RN-web gives every View `z-index: 0`, which makes each one a stacking context and would trap the pinned cells below their row's cover.
// eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- `auto` is a valid CSS z-index the native types don't model.
const PINNED_CELL_CONTAINER_STYLE = {zIndex: 'auto'} as unknown as ViewStyle;

export {PINNED_START_CELL_STYLE, PINNED_CELL_CONTAINER_STYLE, SCROLL_X_TRANSLATE, canUseScrollTimeline, getScrollTimelineAnimation};
