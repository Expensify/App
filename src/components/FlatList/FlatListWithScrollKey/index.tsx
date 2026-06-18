import React from 'react';

import type {FlatListWithScrollKeyProps} from './types';

import BaseFlatListWithScrollKey from './BaseFlatListWithScrollKey';

/**
 * FlatList component that handles initial scroll key.
 */
function FlatListWithScrollKey<T>({ref, ...props}: FlatListWithScrollKeyProps<T>) {
    return (
        <BaseFlatListWithScrollKey
            ref={ref}
            {...props}
        />
    );
}

export default FlatListWithScrollKey;
