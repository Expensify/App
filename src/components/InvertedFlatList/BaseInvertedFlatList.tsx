import React, {ForwardedRef, forwardRef} from 'react';
import {FlatListProps} from 'react-native';
import FlatList from '@components/FlatList';

const AUTOSCROLL_TO_TOP_THRESHOLD = 128;
const WINDOW_SIZE = 15;

function BaseInvertedFlatList<T>(props: FlatListProps<T>, ref: ForwardedRef<FlatList>) {
    return (
        <FlatList
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
            ref={ref}
            windowSize={WINDOW_SIZE}
            maintainVisibleContentPosition={{
                minIndexForVisible: 0,
                autoscrollToTopThreshold: AUTOSCROLL_TO_TOP_THRESHOLD,
            }}
            inverted
        />
    );
}

BaseInvertedFlatList.displayName = 'BaseInvertedFlatList';

export default forwardRef(BaseInvertedFlatList);
