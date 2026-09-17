import useThemeStyles from '@hooks/useThemeStyles';

import type {FlatList} from 'react-native-gesture-handler';

import React from 'react';
import DraggableFlatList from 'react-native-draggable-flatlist';

import type DraggableListProps from './types';

function DraggableList<T>({
    ref,
    onSelectRow,
    focusedIndex,
    isItemDragDisabled,
    isItemDisabled,
    renderItem,
    ...viewProps
}: DraggableListProps<T> & {ref?: React.ForwardedRef<FlatList<T>>}) {
    const styles = useThemeStyles();
    return (
        <DraggableFlatList
            ref={ref}
            containerStyle={styles.flex1}
            contentContainerStyle={styles.flexGrow1}
            ListFooterComponentStyle={styles.flex1}
            {...viewProps}
            // DraggableFlatList reports the drag state only as `isActive`, so mirror it into `isDragging`
            // to keep that param meaning the same thing on both platforms.
            renderItem={(params) => renderItem({...params, isDragging: params.isActive})}
        />
    );
}

export default DraggableList;
