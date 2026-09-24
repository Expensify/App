import type {MeasurableInput} from '@components/SelectionList/SelectionListWithSections/types';

import type {FlashListRef} from '@shopify/flash-list';
import type {ComponentRef, RefObject} from 'react';
import type {NativeScrollEvent, NativeSyntheticEvent, View} from 'react-native';

type ScrollInputIntoViewOptions = {
    /**
     * Also scroll back when the input sits above the anchor. Android partially reveals a focused input that has been
     * scrolled off the top when the caret moves, and only the caller knows whether finishing that reveal is wanted.
     */
    shouldRevealInputAboveAnchor?: boolean;

    /**
     * Scroll straight away instead of waiting for the keyboard and layout to settle, and do it without animating.
     * Use it to correct a native scroll the user has already seen, where the settle delay would read as a second jump.
     */
    shouldScrollImmediately?: boolean;
};

type UseScrollToFocusedInputResult = {
    /** Attach to the list's outer container; its top is used as a stable anchor to pull focused inputs up to. */
    containerRef: RefObject<ComponentRef<typeof View> | null>;

    /** Wire into the list's `onScroll` so we always know the current content offset. */
    trackScrollOffset: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;

    /** Scrolls the list so the given input is visible above the keyboard. Safe to call from an input's `onFocus`. */
    scrollInputIntoView: (input: MeasurableInput, options?: ScrollInputIntoViewOptions) => void;
};

type UseScrollToFocusedInput = (listRef: RefObject<Pick<FlashListRef<unknown>, 'scrollToOffset'> | null>, isKeyboardShown: boolean) => UseScrollToFocusedInputResult;

export type {ScrollInputIntoViewOptions, UseScrollToFocusedInput};
