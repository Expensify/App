import type {FlashListRef} from '@shopify/flash-list';
import type {RefObject} from 'react';
import type {NativeScrollEvent, NativeSyntheticEvent, View} from 'react-native';
import type {MeasurableInput} from '@components/SelectionList/SelectionListWithSections/types';

type UseScrollToFocusedInputResult = {
    /** Attach to the list's outer container; its top is used as a stable anchor to pull focused inputs up to. */
    containerRef: RefObject<View | null>;

    /** Wire into the list's `onScroll` so we always know the current content offset. */
    trackScrollOffset: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;

    /** Scrolls the list so the given input is visible above the keyboard. Safe to call from an input's `onFocus`. */
    scrollInputIntoView: (input: MeasurableInput) => void;
};

type UseScrollToFocusedInput = (listRef: RefObject<Pick<FlashListRef<unknown>, 'scrollToOffset'> | null>, isKeyboardShown: boolean) => UseScrollToFocusedInputResult;

// eslint-disable-next-line import/prefer-default-export
export type {UseScrollToFocusedInput};
