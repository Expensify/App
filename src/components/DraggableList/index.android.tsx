import React from 'react';
import {View} from 'react-native';
import DraggableFlatList from 'react-native-draggable-flatlist';
import type {FlatList} from 'react-native-gesture-handler';
import useThemeStyles from '@hooks/useThemeStyles';
import type {DraggableListProps} from './types';

function DraggableList<T>({renderClone, shouldUsePortal, ListFooterComponent, ...viewProps}: DraggableListProps<T>, ref: React.ForwardedRef<FlatList<T>>) {
    const styles = useThemeStyles();
    return (
        <View style={styles.flex1}>
            <DraggableFlatList
                ref={ref}
                containerStyle={ListFooterComponent ? undefined : styles.flex1}
                contentContainerStyle={ListFooterComponent ? undefined : styles.flexGrow1}
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...viewProps}
            />
            {React.isValidElement(ListFooterComponent) && <View style={styles.flexGrow1}>{ListFooterComponent}</View>}
        </View>
    );
}

DraggableList.displayName = 'DraggableList';

export default React.forwardRef(DraggableList);
