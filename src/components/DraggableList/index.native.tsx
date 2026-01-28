import React from 'react';
import DraggableFlatList from 'react-native-draggable-flatlist';
import type {FlatList} from 'react-native-gesture-handler';
import useThemeStyles from '@hooks/useThemeStyles';
import type DraggableListProps from './types';

function DraggableList<T>({ref, ...viewProps}: DraggableListProps<T> & {ref?: React.ForwardedRef<FlatList<T>>}) {
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

export default DraggableList;
