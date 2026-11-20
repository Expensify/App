import type ActionListRefType from '@pages/inbox/ActionListTypes';

import type {FlashListProps} from '@shopify/flash-list';

/** A FlashList viewability handler that doesn't read the items, so it fits a list of any item type */
type ViewableItemsChangedHandler = NonNullable<FlashListProps<unknown>['onViewableItemsChanged']>;

export default ActionListRefType;
export type {ViewableItemsChangedHandler};
