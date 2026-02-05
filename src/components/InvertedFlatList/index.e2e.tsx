import React from 'react';
import type {ScrollViewProps, ViewToken} from 'react-native';
import {DeviceEventEmitter, FlatList} from 'react-native';
import type {ReportAction} from '@src/types/onyx';
import type {InvertedFlatListProps} from './types';

const AUTOSCROLL_TO_TOP_THRESHOLD = 128;

function InvertedFlatListE2E({ref, ...props}: InvertedFlatListProps<ReportAction>) {
    const {shouldEnableAutoScrollToTopThreshold, ...rest} = props;

    const handleViewableItemsChanged = ({viewableItems}: {viewableItems: ViewToken[]}) => {
        DeviceEventEmitter.emit('onViewableItemsChanged', viewableItems);
    };

    const config: ScrollViewProps['maintainVisibleContentPosition'] = {
        // This needs to be 1 to avoid using loading views as anchors.
        minIndexForVisible: rest.data?.length ? Math.min(1, rest.data.length - 1) : 0,
    };

    if (shouldEnableAutoScrollToTopThreshold) {
        config.autoscrollToTopThreshold = AUTOSCROLL_TO_TOP_THRESHOLD;
    }

    return (
        <FlatList<ReportAction>
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...rest}
            ref={ref}
            maintainVisibleContentPosition={config}
            inverted
            onViewableItemsChanged={handleViewableItemsChanged}
        />
    );
}

export default InvertedFlatListE2E;
