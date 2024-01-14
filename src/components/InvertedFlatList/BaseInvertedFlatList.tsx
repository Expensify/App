import type {ForwardedRef} from 'react';
import React, {forwardRef} from 'react';
import type {FlatListProps} from 'react-native';
import FlatList from '@components/FlatList';

type BaseInvertedFlatListProps<T> = FlatListProps<T> & {
    enableAutoscrollToTopThreshold?: boolean;
};

const AUTOSCROLL_TO_TOP_THRESHOLD = 128;

function BaseInvertedFlatList<T>(props: BaseInvertedFlatListProps<T>, ref: ForwardedRef<FlatList>) {
    const {enableAutoscrollToTopThreshold, ...rest} = props;
    return (
        <FlatList
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...rest}
            ref={ref}
            maintainVisibleContentPosition={{
                // This needs to be 1 to avoid using loading views as anchors.
                minIndexForVisible: 1,
                autoscrollToTopThreshold: enableAutoscrollToTopThreshold ? AUTOSCROLL_TO_TOP_THRESHOLD : null,
            }}
            inverted
        />
    );
}

BaseInvertedFlatList.displayName = 'BaseInvertedFlatList';

export default forwardRef(BaseInvertedFlatList);
