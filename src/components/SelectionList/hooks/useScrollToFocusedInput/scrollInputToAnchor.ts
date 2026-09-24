import type {MeasurableInput} from '@components/SelectionList/SelectionListWithSections/types';

import type {FlashListRef} from '@shopify/flash-list';
import type {ComponentRef, RefObject} from 'react';
import type {View} from 'react-native';

import type {ScrollInputIntoViewOptions} from './types';

/** Extra space (px) left between the focused input and the top of the visible list area after scrolling. */
const EXTRA_SCROLL_PADDING = 16;

/** Smallest distance (px) from the anchor worth scrolling for. */
const MIN_SCROLL_DELTA = 1;

type MeasureInWindowCallback = (x: number, y: number, width: number, height: number) => void;

type MeasurableNode = {
    measureInWindow: (callback: MeasureInWindowCallback) => void;
};

type ScrollInputToAnchorParams = ScrollInputIntoViewOptions & {
    input: MeasurableInput;
    containerRef: RefObject<ComponentRef<typeof View> | null>;
    listRef: RefObject<Pick<FlashListRef<unknown>, 'scrollToOffset'> | null>;

    /**
     * Reads the list's current offset. Measuring is an async round trip and the platform may scroll the caret into
     * view while it is in flight, so the offset has to be read alongside the measurements rather than before them.
     */
    getCurrentOffset: () => number;
};

function isMeasurable(node: MeasurableInput): node is MeasurableNode {
    return typeof node === 'object' && node !== null && 'measureInWindow' in node && typeof node.measureInWindow === 'function';
}

/**
 * Scrolls the list so a focused input sits just below the top of the visible list area.
 *
 * The list container grows to fit its content, so its bottom is not the visible area. Its top is a stable anchor
 * instead, and the viewport is bounded above any sticky footer, so anchoring to the top reliably reveals the input
 * within the available scroll range.
 */
function scrollInputToAnchor({input, containerRef, listRef, getCurrentOffset, shouldRevealInputAboveAnchor = false, shouldScrollImmediately = false}: ScrollInputToAnchorParams) {
    const container = containerRef.current;
    const list = listRef.current;
    if (!isMeasurable(input) || !container || !list) {
        return;
    }

    container.measureInWindow((containerX, containerY) => {
        input.measureInWindow((inputX, inputY) => {
            const anchor = containerY + EXTRA_SCROLL_PADDING;
            const delta = inputY - anchor;
            // Sub-pixel measurements would otherwise queue a scroll on every keystroke.
            if (Math.abs(delta) < MIN_SCROLL_DELTA) {
                return;
            }
            // Pulling an input down to the anchor hides list content the user scrolled to on purpose, so callers
            // have to ask for it.
            if (delta < 0 && !shouldRevealInputAboveAnchor) {
                return;
            }
            list.scrollToOffset({offset: getCurrentOffset() + delta, animated: !shouldScrollImmediately});
        });
    });
}

export default scrollInputToAnchor;
export {isMeasurable};
