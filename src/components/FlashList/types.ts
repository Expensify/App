import type {RefObject} from 'react';
import type {FlatList} from 'react-native';

/** Ref to the underlying list instance attached via `ref={}`. */
type FlatListRefType = RefObject<FlatList | null> | null;

export default FlatListRefType;
