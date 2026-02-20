import {FlashList} from '@shopify/flash-list';
import React, {useCallback} from 'react';
import Animated from 'react-native-reanimated';
import type BaseSearchListProps from './types';
import type {SearchListDataItem} from './types';

const AnimatedFlashListComponent = Animated.createAnimatedComponent(FlashList<SearchListDataItem>);

function BaseSearchList({
    data,
    renderItem,
    keyExtractor,
    onScroll,
    ref,
    onEndReached,
    onEndReachedThreshold,
    ListFooterComponent,
    onViewableItemsChanged,
    onLayout,
    contentContainerStyle,
}: BaseSearchListProps) {
    const renderItemWithoutKeyboardFocus = useCallback(
        ({item, index}: {item: SearchListDataItem; index: number}) => {
            return renderItem(item, index, false, undefined);
        },
        [renderItem],
    );

    return (
        <AnimatedFlashListComponent
            data={data}
            renderItem={renderItemWithoutKeyboardFocus}
            keyExtractor={keyExtractor}
            onScroll={onScroll}
            showsVerticalScrollIndicator={false}
            ref={ref}
            onEndReached={onEndReached}
            onEndReachedThreshold={onEndReachedThreshold}
            ListFooterComponent={ListFooterComponent}
            onViewableItemsChanged={onViewableItemsChanged}
            onLayout={onLayout}
            removeClippedSubviews
            drawDistance={1000}
            contentContainerStyle={contentContainerStyle}
            maintainVisibleContentPosition={{disabled: true}}
        />
    );
}

export default BaseSearchList;
