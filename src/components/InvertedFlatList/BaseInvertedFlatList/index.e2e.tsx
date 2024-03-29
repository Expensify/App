import React, {forwardRef, useMemo} from 'react';
import type {FlatListProps, ScrollViewProps, ViewToken} from 'react-native';
import {FlatList} from 'react-native';
import type {ReportAction} from '@src/types/onyx';

type BaseInvertedFlatListProps = FlatListProps<ReportAction> & {
    shouldEnableAutoScrollToTopThreshold?: boolean;
};

const AUTOSCROLL_TO_TOP_THRESHOLD = 128;

let localViewableItems: ViewToken[];
const getViewableItems = () => console.log(787878798792) || localViewableItems;

function BaseInvertedFlatListE2e(props: BaseInvertedFlatListProps, ref: React.ForwardedRef<FlatList<ReportAction>>) {
    const {shouldEnableAutoScrollToTopThreshold, ...rest} = props;
    console.log("BaseInvertedFlatListE2e");

    const handleViewableItemsChanged = useMemo(
        () =>
            ({viewableItems}: {viewableItems: ViewToken[]}) => {
                console.log("handleViewableItemsChanged", {viewableItems});
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
        <FlatList<ReportAction>
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
