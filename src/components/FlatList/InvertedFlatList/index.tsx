import React from 'react';
import FlatList from '@components/FlatList/FlatList';
import useFlatListScrollKey from '@components/FlatList/hooks/useFlatListScrollKey';
import useThemeStyles from '@hooks/useThemeStyles';
import getPlatform from '@libs/getPlatform';
import CONST from '@src/CONST';
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
    focusToTopOnMount = false,
    initialScrollKey,
    data,
    onStartReached,
    renderItem,
    keyExtractor = defaultKeyExtractor,
    ...restProps
}: InvertedFlatListProps<T>) {
    const {displayedData, maintainVisibleContentPosition, handleStartReached, handleRenderItem, listRef} = useFlatListScrollKey<T>({
        data,
        keyExtractor,
        initialScrollKey,
        inverted: true,
        onStartReached,
        shouldEnableAutoScrollToTopThreshold,
        renderItem,
        ref,
    });
    const styles = useThemeStyles();

    const platform = getPlatform();
    const isWeb = platform === CONST.PLATFORM.WEB;
    const shouldFocusToTopOnMount = !isWeb ? focusToTopOnMount : !focusToTopOnMount;

    return (
        <FlatList<T>
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...restProps}
            ref={listRef}
            maintainVisibleContentPosition={maintainVisibleContentPosition}
            inverted
            data={displayedData}
            renderItem={handleRenderItem}
            keyExtractor={keyExtractor}
            onStartReached={handleStartReached}
            CellRendererComponent={CellRendererComponent}
            removeClippedSubviews={shouldRemoveClippedSubviews}
            contentContainerStyle={[
                restProps.contentContainerStyle,
                restProps.horizontal ? styles.flexRowReverse : styles.flexColumnReverse,
                !shouldFocusToTopOnMount ? styles.justifyContentEnd : undefined,
            ]}
        />
    );
}

export default InvertedFlatList;
