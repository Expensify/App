import {FlashList} from '@shopify/flash-list';
import React, {useCallback} from 'react';
import Animated from 'react-native-reanimated';
import type {SearchListItem} from '@components/SelectionList/types';
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
    estimatedItemSize,
    overrideItemLayout,
    estimatedListSize,
    contentContainerStyle,
    calculatedListHeight,
}: BaseSearchListProps) {
    const renderItemWithoutKeyboardFocus = useCallback(
        ({item, index}: {item: SearchListItem; index: number}) => {
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
            estimatedItemSize={estimatedItemSize}
            overrideItemLayout={overrideItemLayout}
            estimatedListSize={estimatedListSize}
            contentContainerStyle={contentContainerStyle}
            overrideProps={{estimatedHeightSize: calculatedListHeight}}
        />
    );
}

BaseSearchList.displayName = 'BaseSearchList';

export default BaseSearchList;
