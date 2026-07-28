import type {FlatList as RNFlatList} from 'react-native';

type FlatListInnerRefType<T> = RNFlatList<T> & HTMLElement;

// eslint-disable-next-line import/prefer-default-export
export type {FlatListInnerRefType};
