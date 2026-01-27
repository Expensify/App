import React from 'react';
import BaseFlatListWithScrollKey from './BaseFlatListWithScrollKey';
import type {FlatListWithScrollKeyProps} from './types';

/**
 * FlatList component that handles initial scroll key.
 */
function FlatListWithScrollKey<T>({ref, ...props}: FlatListWithScrollKeyProps<T>) {
    return (
        <BaseFlatListWithScrollKey
            ref={ref}
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
        />
    );
}

export default FlatListWithScrollKey;
