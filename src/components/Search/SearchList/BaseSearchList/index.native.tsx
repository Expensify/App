import type {SearchListItem} from '@components/Search/SearchList/ListItem/types';

import {AnimatedLegendList} from '@legendapp/list/reanimated';
import React from 'react';

import type BaseSearchListProps from './types';

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
    getFixedItemSize,
}: BaseSearchListProps) {
    const renderItemWithoutKeyboardFocus = ({item, index}: {item: SearchListItem; index: number}) => {
        return renderItem(item, index, false, undefined);
    };

    return (
        <AnimatedLegendList
            data={data}
            renderItem={renderItemWithoutKeyboardFocus}
            keyExtractor={keyExtractor}
            onScroll={onScroll}
            showsVerticalScrollIndicator={false}
            ref={ref}
            extraData={renderItemWithoutKeyboardFocus}
            onEndReached={onEndReached}
            onEndReachedThreshold={onEndReachedThreshold}
            ListFooterComponent={ListFooterComponent}
            onViewableItemsChanged={onViewableItemsChanged}
            onLayout={onLayout}
            drawDistance={250}
            contentContainerStyle={contentContainerStyle}
            maintainVisibleContentPosition={false}
            stickyHeaderIndices={stickyHeaderIndices}
            getItemType={getItemType}
            getFixedItemSize={getFixedItemSize}
        />
    );
}

export default BaseSearchList;
