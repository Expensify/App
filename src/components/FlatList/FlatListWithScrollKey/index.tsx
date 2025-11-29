import type {ForwardedRef} from 'react';
import React, {forwardRef} from 'react';
import type {FlatList as RNFlatList} from 'react-native';
import BaseFlatListWithScrollKey from './BaseFlatListWithScrollKey';
import type {FlatListWithScrollKeyProps} from './types';

/**
 * FlatList component that handles initial scroll key.
 */
function FlatListWithScrollKey<T>(props: FlatListWithScrollKeyProps<T>, ref: ForwardedRef<RNFlatList>) {
    return (
        <BaseFlatListWithScrollKey
            ref={ref}
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
        />
    );
}

FlatListWithScrollKey.displayName = 'FlatListWithScrollKey';

export default forwardRef(FlatListWithScrollKey);
