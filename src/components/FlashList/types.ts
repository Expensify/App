import type {FlashListRef} from '@shopify/flash-list';
import type {RefObject} from 'react';
import type {FlatList} from 'react-native';

/** Ref to the underlying list instance attached via `ref={}`. */
type FlatListRefType = RefObject<FlatList<unknown> | null> | null;

/** Ref to the underlying list instance attached via `ref={}`. */
type FlashListRefType = RefObject<FlashListRef<unknown> | null> | null;

export default FlatListRefType;
export type {FlashListRefType};
