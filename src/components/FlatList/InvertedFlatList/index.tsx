import React, {useState} from 'react';
import FlatList from '@components/FlatList/FlatList';
import useFlatListScrollKey from '@components/FlatList/hooks/useFlatListScrollKey';
import CellRendererComponent from './CellRendererComponent';
import shouldRemoveClippedSubviews from './shouldRemoveClippedSubviews';
import type {InvertedFlatListProps} from './types';

// Adapted from https://github.com/facebook/react-native/blob/29a0d7c3b201318a873db0d1b62923f4ce720049/packages/virtualized-lists/Lists/VirtualizeUtils.js#L237
function defaultKeyExtractor<T>(item: T | {key: string} | {id: string}, index: number): string {
    if (item != null) {
        if (typeof item === 'object' && 'key' in item) {
            return item.key;
        }
        if (typeof item === 'object' && 'id' in item) {
            return item.id;
        }
    }
    return String(index);
}

function InvertedFlatList<T>({
    ref,
    shouldEnableAutoScrollToTopThreshold,
    initialScrollKey,
    data,
    initialNumToRender,
    onStartReached,
    renderItem,
    keyExtractor = defaultKeyExtractor,
    onContentSizeChange,
    onInitiallyLoaded,
    ...restProps
}: InvertedFlatListProps<T>) {
    const [didInitialContentRender, setDidInitialContentRender] = useState(false);
    const handleContentSizeChange = (contentWidth: number, contentHeight: number) => {
        onContentSizeChange?.(contentWidth, contentHeight);
        setDidInitialContentRender(true);
    };

    const {displayedData, maintainVisibleContentPosition, handleStartReached, handleRenderItem, listRef} = useFlatListScrollKey<T>({
        data,
        keyExtractor,
        initialScrollKey,
        inverted: true,
        onStartReached,
        shouldEnableAutoScrollToTopThreshold,
        renderItem,
        initialNumToRender,
        didInitialContentRender,
        onInitiallyLoaded,
        ref,
    });

    return (
        <FlatList<T>
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...restProps}
            ref={listRef}
            maintainVisibleContentPosition={maintainVisibleContentPosition}
            inverted
            data={displayedData}
            initialNumToRender={initialNumToRender}
            renderItem={handleRenderItem}
            keyExtractor={keyExtractor}
            onStartReached={handleStartReached}
            onContentSizeChange={handleContentSizeChange}
            CellRendererComponent={CellRendererComponent}
            removeClippedSubviews={shouldRemoveClippedSubviews}
        />
    );
}

export default InvertedFlatList;
