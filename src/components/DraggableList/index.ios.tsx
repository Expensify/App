import React from 'react';
import DraggableFlatList from 'react-native-draggable-flatlist';
import type {FlatList} from 'react-native-gesture-handler';
import useThemeStyles from '@hooks/useThemeStyles';
import { View } from 'react-native';

import type {DraggableListProps} from './types';

function DraggableList<T>({...viewProps}: DraggableListProps<T>, ref: React.ForwardedRef<FlatList<T>>) {
    const styles = useThemeStyles();

    const viewStyle = viewProps.heights 
        ? { height: viewProps.data.length * viewProps.heights.element + viewProps.heights.footer} 
        : styles.flex1;

    console.log(`viewStyle = ${JSON.stringify(viewStyle)}`);
      
    return (
        <View style={viewStyle}>
            <DraggableFlatList
                ref={ref}
                containerStyle={styles.flex1}
                contentContainerStyle={styles.flexGrow1}
                ListFooterComponentStyle={styles.flex1}
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...viewProps}
            />
        </View>
    );
}

DraggableList.displayName = 'DraggableList';

export default React.forwardRef(DraggableList);
