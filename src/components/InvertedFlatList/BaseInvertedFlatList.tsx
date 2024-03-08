import type {ForwardedRef} from 'react';
import React, {forwardRef} from 'react';
import type {FlatListProps} from 'react-native';
import FlatList from '@components/FlatList';

const WINDOW_SIZE = 15;
const AUTOSCROLL_TO_TOP_THRESHOLD = 250;

const maintainVisibleContentPosition = {
    minIndexForVisible: 0,
    autoscrollToTopThreshold: AUTOSCROLL_TO_TOP_THRESHOLD,
};

function BaseInvertedFlatList<T>(props: FlatListProps<T>, ref: ForwardedRef<FlatList>) {
    return (
        <FlatList
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
            ref={ref}
            windowSize={WINDOW_SIZE}
            maintainVisibleContentPosition={maintainVisibleContentPosition}
            inverted
        />
    );
}

BaseInvertedFlatList.displayName = 'BaseInvertedFlatList';

export default forwardRef(BaseInvertedFlatList);
