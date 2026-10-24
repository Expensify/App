import type {FlashListRef} from '@shopify/flash-list';
import type {RefObject} from 'react';

/** Ref to the underlying list instance attached via `ref={}`. */
type FlatListRefType = RefObject<FlashListRef<unknown> | null> | null;

export default FlatListRefType;
