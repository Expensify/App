import useThemeStyles from '@hooks/useThemeStyles';

import type {FlatList} from 'react-native-gesture-handler';

import noop from 'lodash/noop';
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
    disableScroll,
    ...viewProps
}: DraggableListProps<T> & {ref?: React.ForwardedRef<FlatList<T>>}) {
    const styles = useThemeStyles();
    if (disableScroll) {
        const {data, keyExtractor, renderItem, onDragEnd, ListFooterComponent, ...listProps} = viewProps;
        const draggableItems = data.filter((item) => !isItemDragDisabled?.(item));
        const staticItems = data.filter((item) => isItemDragDisabled?.(item));
        // The list excludes its footer from the drag bounds, so these rows remain tappable without becoming drop targets.
        const footer =
            staticItems.length > 0 || ListFooterComponent ? (
                <View>
                    {staticItems.map((item, index) => (
                        <React.Fragment key={keyExtractor(item, draggableItems.length + index)}>
                            {renderItem({item, getIndex: () => draggableItems.length + index, drag: noop, isActive: false})}
                        </React.Fragment>
                    ))}
                    {ListFooterComponent}
                </View>
            ) : undefined;

        return (
            <NestableDraggableFlatList
                ref={ref}
                {...listProps}
                data={draggableItems}
                keyExtractor={keyExtractor}
                renderItem={renderItem}
                ListFooterComponent={footer}
                onDragEnd={({data: reorderedItems}) => onDragEnd?.({data: [...reorderedItems, ...staticItems]})}
            />
        );
    }

    return (
        <DraggableFlatList
            ref={ref}
            containerStyle={styles.flex1}
            contentContainerStyle={styles.flexGrow1}
            ListFooterComponentStyle={styles.flex1}
            {...viewProps}
        />
    );
}

export default DraggableList;
