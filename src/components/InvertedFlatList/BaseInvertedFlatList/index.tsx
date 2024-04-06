import type {ForwardedRef} from 'react';
import React, {forwardRef, useMemo} from 'react';
import type {FlatListProps, FlatList as RNFlatList, ScrollViewProps} from 'react-native';
import FlatList from '@components/FlatList';

type BaseInvertedFlatListProps<T> = FlatListProps<T> & {
    shouldEnableAutoScrollToTopThreshold?: boolean;
};

const AUTOSCROLL_TO_TOP_THRESHOLD = 250;

function BaseInvertedFlatList<T>(props: BaseInvertedFlatListProps<T>, ref: ForwardedRef<RNFlatList>) {
    const {shouldEnableAutoScrollToTopThreshold, ...rest} = props;

    const maintainVisibleContentPosition = useMemo(() => {
        const config: ScrollViewProps['maintainVisibleContentPosition'] = {
            // This needs to be 1 to avoid using loading views as anchors.
            minIndexForVisible: 1,
        };

        if (shouldEnableAutoScrollToTopThreshold) {
            config.autoscrollToTopThreshold = AUTOSCROLL_TO_TOP_THRESHOLD;
        }

        return config;
    }, [shouldEnableAutoScrollToTopThreshold]);

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

export {AUTOSCROLL_TO_TOP_THRESHOLD};
