import type {ForwardedRef} from 'react';
import React, {forwardRef} from 'react';
import type {FlatListProps, FlatList as RNFlatList} from 'react-native';
import useFlatListScrollKey from '@hooks/useFlatListScrollKey';
import FlatList from '.';

type BaseFlatListProps<T> = Omit<FlatListProps<T>, 'data' | 'initialScrollIndex'> & {
    data: T[];
    initialScrollKey?: string | null | undefined;
    keyExtractor: (item: T, index: number) => string;
};

function BaseFlatList<T>({data, keyExtractor, initialScrollKey, onEndReached, ...props}: BaseFlatListProps<T>, ref: ForwardedRef<RNFlatList>) {
    const {handleEndReached, displayedData} = useFlatListScrollKey<T>(data, keyExtractor, initialScrollKey, false, undefined, onEndReached);

    return (
        <FlatList
            ref={ref}
            data={displayedData}
            onEndReached={handleEndReached}
            keyExtractor={keyExtractor}
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
        />
    );
}

export default forwardRef(BaseFlatList);
