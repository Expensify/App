import type {ForwardedRef} from 'react';
import React, {forwardRef, useMemo} from 'react';
import type {FlatListProps, ScrollViewProps} from 'react-native';
import FlatList from '@components/FlatList';

type BaseInvertedFlatListProps<T> = FlatListProps<T> & {
    shouldEnableAutoScrollToTopThreshold?: boolean;
};

const AUTOSCROLL_TO_TOP_THRESHOLD = 128;

let localViewableItems: unknown;
const getViewableItems = () => localViewableItems;

function BaseInvertedFlatListE2e<T>(props: BaseInvertedFlatListProps<T>, ref: ForwardedRef<FlatList>) {
    const {shouldEnableAutoScrollToTopThreshold, ...rest} = props;

    const handleViewableItemsChanged = ({viewableItems}: { viewableItems: unknown }) => {
        localViewableItems = viewableItems;
    };

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
            onViewableItemsChanged={handleViewableItemsChanged}
        />
    );
}

BaseInvertedFlatListE2e.displayName = 'BaseInvertedFlatListE2e';

export default forwardRef(BaseInvertedFlatListE2e);
export {getViewableItems};
