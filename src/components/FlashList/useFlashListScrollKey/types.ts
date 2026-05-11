import type {FlashListProps} from '@shopify/flash-list';

type FlashListScrollKeyProps<T> = {
    /** The array of items to render in the list. */
    data: T[];

    /** Function that extracts a unique key for each item in the list. */
    keyExtractor: (item: T, index: number) => string;

    /** Key of the item to initially scroll to when the list first renders. */
    initialScrollKey: string | null | undefined;

    /** Callback invoked when the user scrolls close to the start of the list. */
    onStartReached: FlashListProps<T>['onStartReached'];

    /** Whether the list should handle `maintainVisibleContentPosition` */
    shouldMaintainVisibleContentPosition?: boolean;

    /** Whether the list should focus to top on mount, ex: for transaction threads */
    shouldFocusToTopOnMount?: boolean;
};

export default FlashListScrollKeyProps;
