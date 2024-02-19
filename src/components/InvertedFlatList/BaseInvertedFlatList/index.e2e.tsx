import type {ForwardedRef} from 'react';
import React, {forwardRef, useMemo} from 'react';
import type {FlatListProps, ScrollViewProps} from 'react-native';
import FlatList from '@components/FlatList';

type BaseInvertedFlatListProps<T> = FlatListProps<T> & {
    shouldEnableAutoScrollToTopThreshold?: boolean;
};

const AUTOSCROLL_TO_TOP_THRESHOLD = 128;

type ViewableItem<T extends {reportActionID: string}> = {
    item: T;
    index: number;
    key: string;
    isViewable: boolean;
};

let localViewableItems: Array<ViewableItem<{reportActionID: string}>> | undefined;

const getViewableItems = <T extends {reportActionID: string}>(): Array<ViewableItem<T>> | undefined => localViewableItems as Array<ViewableItem<T>> | undefined;

function BaseInvertedFlatListE2e<T extends {reportActionID: string}>(props: BaseInvertedFlatListProps<T>, ref: ForwardedRef<FlatList<T>>) {
    const {shouldEnableAutoScrollToTopThreshold, ...rest} = props;

    const handleViewableItemsChanged = useMemo(
        () =>
            ({viewableItems}: {viewableItems: Array<ViewableItem<T>>}) => {
                localViewableItems = viewableItems;
            },
        [],
    );

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
        <FlatList<T>
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
