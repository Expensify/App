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

// Memoized so a parent re-render with unchanged props (e.g. a message sent while this list's screen is blurred)
// skips it entirely. RC memoizes the internals but does not add a memo() boundary, so add it explicitly.
// The cast restores the generic signature that memo() erases (callers rely on data/renderItem inference).
// eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
export default memo(FlatListWithScrollKey) as typeof FlatListWithScrollKey;
