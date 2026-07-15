import type {FlashListProps, FlashListRef} from '@shopify/flash-list';
import type {RefObject} from 'react';
import type {CellRendererProps, FlatList} from 'react-native';

/** Ref to the underlying list instance attached via `ref={}`. */
type FlatListRefType<T = unknown> = RefObject<FlatList<T> | null> | null;

/** Ref to the underlying list instance attached via `ref={}`. */
type FlashListRefType<T = unknown> = RefObject<FlashListRef<T> | null> | null;

type CustomFlashListProps<T> = Omit<FlashListProps<T>, 'CellRendererComponent'> & {
    /** Ref to the underlying list instance. */
    ref?: FlashListRefType<T>;

    /**
     * Whether to use the animated keyboard handler capabilities on native (iOS and Android)
     * Allows for interactive keyboard dismissal when the user drags the keyboard down
     */
    enableAnimatedKeyboardDismissal?: boolean;

    /**
     * Custom cell renderer component
     */
    CellRendererComponent?: React.ComponentType<CellRendererProps<T>>;

    /** The array of items to render in the list. */
    data: T[];

    /** Function that extracts a unique key for each item in the list. */
    keyExtractor: (item: T, index: number) => string;
};
export default FlatListRefType;
export type {FlashListRefType, CustomFlashListProps};
