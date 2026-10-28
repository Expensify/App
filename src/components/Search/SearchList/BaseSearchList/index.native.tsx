import useTabRootScrollProps from '@components/Navigation/TabBarBottomContent/useTabRootScrollProps';
import type {SearchListItem} from '@components/Search/SearchList/ListItem/types';

import {FlashList} from '@shopify/flash-list';
import React from 'react';
import Animated from 'react-native-reanimated';

import type BaseSearchListProps from './types';

const AnimatedFlashListComponent = Animated.createAnimatedComponent(FlashList<SearchListItem>);

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
    const tabRootScrollProps = useTabRootScrollProps(contentContainerStyle);
    const renderItemWithoutKeyboardFocus = ({item, index}: {item: SearchListItem; index: number}) => {
        return renderItem(item, index, undefined);
    };

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
            {...tabRootScrollProps}
            maintainVisibleContentPosition={{disabled: true}}
            stickyHeaderIndices={stickyHeaderIndices}
            getItemType={getItemType}
        />
    );
}

export default BaseSearchList;
