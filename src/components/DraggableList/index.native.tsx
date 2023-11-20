import React from 'react';
import DraggableFlatList from 'react-native-draggable-flatlist';
import {FlatList} from 'react-native-gesture-handler';
import useThemeStyles from '@styles/useThemeStyles';
import type {DraggableListProps} from './types';

function DraggableList<T>({renderClone, shouldUsePortal, ...viewProps}: DraggableListProps<T>, ref: React.ForwardedRef<FlatList<T>>) {
    const styles = useThemeStyles();
    return (
        <DraggableFlatList
            ref={ref}
            containerStyle={styles.flex1}
            contentContainerStyle={styles.flexGrow1}
            ListFooterComponentStyle={styles.flex1}
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...viewProps}
        />
    );
}

DraggableList.displayName = 'DraggableList';

export default React.forwardRef(DraggableList);
