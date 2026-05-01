import {FlashList} from '@shopify/flash-list';
import React, {useCallback} from 'react';
import Animated from 'react-native-reanimated';
import type {SearchFlashListItem} from '@components/Search/SearchList/ListItem/types';
import type BaseSearchListProps from './types';

const AnimatedFlashListComponent = Animated.createAnimatedComponent(FlashList<SearchFlashListItem>);

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
    stickyHeaderIndices,
    getItemType,
}: BaseSearchListProps) {
    const renderItemWithoutKeyboardFocus = useCallback(
        ({item, index}: {item: SearchFlashListItem; index: number}) => {
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
            drawDistance={250}
            contentContainerStyle={contentContainerStyle}
            maintainVisibleContentPosition={{disabled: true}}
            stickyHeaderIndices={stickyHeaderIndices}
            getItemType={getItemType}
        />
    );
}

export default BaseSearchList;
