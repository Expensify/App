import React, {memo} from 'react';

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

// memo() so unchanged props skip a re-render; RC memoizes internals but adds no memo() boundary of its own.
// The cast restores the generic signature memo() erases (callers rely on data/renderItem inference).
export default memo(FlatListWithScrollKey);
