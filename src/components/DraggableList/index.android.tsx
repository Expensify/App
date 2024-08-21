import React from 'react';
import {View} from 'react-native';
import {NestableDraggableFlatList, NestableScrollContainer} from 'react-native-draggable-flatlist';
import type {ScrollView} from 'react-native-gesture-handler';
import useThemeStyles from '@hooks/useThemeStyles';
import type {DraggableListProps} from './types';

function DraggableList<T>({renderClone, shouldUsePortal, ListFooterComponent, ...viewProps}: DraggableListProps<T>, ref: React.ForwardedRef<ScrollView>) {
    const styles = useThemeStyles();
    return (
        <NestableScrollContainer
            ref={ref}
            contentContainerStyle={styles.flexGrow1}
        >
            <NestableDraggableFlatList
                contentContainerStyle={styles.flex1}
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...viewProps}
            />
            {React.isValidElement(ListFooterComponent) && <View style={styles.flexGrow1}>{ListFooterComponent}</View>}
        </NestableScrollContainer>
    );
}

DraggableList.displayName = 'DraggableList';

export default React.forwardRef(DraggableList);
