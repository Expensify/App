import {FlashList} from '@shopify/flash-list';
import React, {useCallback} from 'react';
import Animated from 'react-native-reanimated';
import type {SearchListItem} from '@components/SelectionList/types';
import variables from '@styles/variables';
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
    estimatedItemSize = variables.optionRowHeight,
}: BaseSearchListProps) {
    const renderItemWithoutKeyboardFocus = useCallback(
        ({item}: {item: SearchListItem; index: number}) => {
            return renderItem(item, false, undefined);
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
            maintainVisibleContentPosition={undefined}
            estimatedItemSize={estimatedItemSize}
        />
    );
}

BaseSearchList.displayName = 'BaseSearchList';

export default BaseSearchList;
