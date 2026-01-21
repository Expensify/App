import type {FlashListProps, FlashListRef} from '@shopify/flash-list';
import type {ForwardedRef} from 'react';

type CustomFlashListProps<T> = FlashListProps<T> & {
    /**
     * Ref to the FlatList component
     */
    ref?: ForwardedRef<FlashListRef<T>>;

    /**
     * Whether to disable the visible content position
     */
    shouldDisableVisibleContentPosition?: boolean;

    /** Reverses the list */
    inverted?: boolean;

    /** If should start rendering from top */
    shouldStartRenderingFromTop?: boolean;

    /**
     * Whether to use the animated keyboard handler capabilities on native (iOS and Android)
     * Allows for interactive keyboard dismissal when the user drags the keyboard down
     *
     * This logic isn't supported by the FlashList yet
     */
    enableAnimatedKeyboardDismissal?: boolean;
};

export default CustomFlashListProps;
