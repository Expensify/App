import React from 'react';
import DraggableFlatList from 'react-native-draggable-flatlist';
import type {FlatList} from 'react-native-gesture-handler';
import useThemeStyles from '@hooks/useThemeStyles';

import type {DraggableListProps} from './types';

function DraggableList<T>({...viewProps}: DraggableListProps<T>, ref: React.ForwardedRef<FlatList<T>>) {
    const styles = useThemeStyles();


    const containerStyle = viewProps.heights 
        ? { height: Math.min(viewProps.data.length, viewProps.heights.maxRows) * viewProps.heights.element 
            + viewProps.heights.footer} 
        : styles.flex1;
      
    return (
            <DraggableFlatList
                ref={ref}
                containerStyle={containerStyle}
                contentContainerStyle={styles.flexGrow1}
                ListFooterComponentStyle={styles.flex1}
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...viewProps}
            />
    );
}

DraggableList.displayName = 'DraggableList';

export default React.forwardRef(DraggableList);
