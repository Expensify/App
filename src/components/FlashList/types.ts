import type {FlashListProps} from '@shopify/flash-list';

/** A FlashList viewability handler that doesn't read the items, so it fits a list of any item type */
type ViewableItemsChangedHandler = NonNullable<FlashListProps<unknown>['onViewableItemsChanged']>;

// eslint-disable-next-line import/prefer-default-export -- Existing FlashList callers import this shared type by name.
export type {ViewableItemsChangedHandler};
