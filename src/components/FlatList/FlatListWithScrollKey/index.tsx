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

// memo() so unchanged props skip a re-render. The cast restores the generic <T> that memo() erases.
// eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- memo() drops the generic; the cast re-narrows it back to the original signature.
export default memo(FlatListWithScrollKey) as typeof FlatListWithScrollKey;
