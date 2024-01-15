import type {ForwardedRef} from 'react';
import React, {forwardRef, useMemo} from 'react';
import type {FlatListProps} from 'react-native';
import FlatList from '@components/FlatList';

type BaseInvertedFlatListProps<T> = FlatListProps<T> & {
    enableAutoscrollToTopThreshold?: boolean;
};
type VisibleContentPositionConfig = {
    minIndexForVisible: number;
    autoscrollToTopThreshold?: number;
};
const AUTOSCROLL_TO_TOP_THRESHOLD = 128;

function BaseInvertedFlatList<T>(props: BaseInvertedFlatListProps<T>, ref: ForwardedRef<FlatList>) {
    const {enableAutoscrollToTopThreshold, ...rest} = props;

    const maintainVisibleContentPosition = useMemo(() => {
        const config: VisibleContentPositionConfig = {
            // This needs to be 1 to avoid using loading views as anchors.
            minIndexForVisible: 1,
        };

        if (enableAutoscrollToTopThreshold) {
            config.autoscrollToTopThreshold = AUTOSCROLL_TO_TOP_THRESHOLD;
        }

        return config;
    }, [enableAutoscrollToTopThreshold]);
    return (
        <FlatList
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...rest}
            ref={ref}
            maintainVisibleContentPosition={maintainVisibleContentPosition}
            inverted
        />
    );
}

BaseInvertedFlatList.displayName = 'BaseInvertedFlatList';

export default forwardRef(BaseInvertedFlatList);
