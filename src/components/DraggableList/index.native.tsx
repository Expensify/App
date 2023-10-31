import React from 'react';
import {ViewStyle} from 'react-native';
import DraggableFlatList from 'react-native-draggable-flatlist';
import {FlatList} from 'react-native-gesture-handler';
import useThemeStyles from '@styles/useThemeStyles';
import type {DraggableListProps} from './types';

function DraggableList<T>({renderClone, shouldUsePortal, ...viewProps}: DraggableListProps<T>, ref: React.ForwardedRef<FlatList<T>>) {
    const styles = useThemeStyles();
    return (
        <DraggableFlatList
            ref={ref}
            containerStyle={styles.flex1 as ViewStyle}
            contentContainerStyle={styles.flexGrow1 as ViewStyle}
            ListFooterComponentStyle={styles.flex1 as ViewStyle}
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...viewProps}
        />
    );
}

DraggableList.displayName = 'DraggableList';

export default React.forwardRef(DraggableList);
