import {FlatListProps} from 'react-native';

type InvertedFlatListProps<T> = FlatListProps<T> & {
    /** Handler called when the scroll actions ends */
    onScrollEnd: () => void;
};

export default InvertedFlatListProps;
export type {InvertedFlatListProps};
