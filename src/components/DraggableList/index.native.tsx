import useThemeStyles from '@hooks/useThemeStyles';

import type {FlatList} from 'react-native-gesture-handler';

import React from 'react';
import {View} from 'react-native';
import DraggableFlatList, {NestableDraggableFlatList} from 'react-native-draggable-flatlist';

import type DraggableListProps from './types';

function DraggableList<T>({
    ref,
    onSelectRow,
    focusedIndex,
    isItemDragDisabled,
    isItemDisabled,
    shouldRestrictDragToEnabledItems = false,
    data,
    onDragEnd,
    ListFooterComponent,
    disableScroll = false,
    ...viewProps
}: DraggableListProps<T> & {ref?: React.ForwardedRef<FlatList<T>>}) {
    const styles = useThemeStyles();
    const ListComponent = disableScroll ? NestableDraggableFlatList : DraggableFlatList;
    const draggableItems = shouldRestrictDragToEnabledItems ? data.filter((item) => !isItemDragDisabled?.(item)) : data;
    const fixedItems = shouldRestrictDragToEnabledItems ? data.filter((item) => isItemDragDisabled?.(item)) : [];

    // Fixed rows stay visible without becoming drop targets. The dragged row may hover over
    // them, then snap back to the last valid position, matching the web column picker's behavior.
    const footer =
        fixedItems.length > 0 ? (
            <View>
                {fixedItems.map((item, index) => (
                    <React.Fragment key={viewProps.keyExtractor(item, draggableItems.length + index)}>
                        {viewProps.renderItem({item, getIndex: () => draggableItems.length + index, drag: () => {}, isActive: false})}
                    </React.Fragment>
                ))}
                {ListFooterComponent}
            </View>
        ) : (
            ListFooterComponent
        );

    return (
        <ListComponent
            ref={ref}
            containerStyle={disableScroll ? undefined : styles.flex1}
            contentContainerStyle={styles.flexGrow1}
            ListFooterComponentStyle={styles.flex1}
            {...viewProps}
            data={draggableItems}
            ListFooterComponent={footer}
            dragItemOverflow={shouldRestrictDragToEnabledItems}
            onDragEnd={onDragEnd ? ({data: reorderedItems}) => onDragEnd({data: [...reorderedItems, ...fixedItems]}) : undefined}
        />
    );
}

export default DraggableList;
