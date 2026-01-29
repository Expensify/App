import {FlashList} from '@shopify/flash-list';
import React from 'react';
import type CustomFlashListProps from './types';

function MVCPFlatList<TItem>({shouldStartRenderingFromTop, inverted, ...restProps}: CustomFlashListProps<TItem>) {
    const shouldStartRenderingFromBottom = !shouldStartRenderingFromTop && !!inverted;

    return (
        <FlashList
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...restProps}
            maintainVisibleContentPosition={{
                animateAutoScrollToBottom: false,
                autoscrollToTopThreshold: 0.2,
                autoscrollToBottomThreshold: 0.2,
                ...(shouldStartRenderingFromBottom ? {startRenderingFromBottom: true} : {}),
            }}
            drawDistance={1000}
        />
    );
}

export default MVCPFlatList;
