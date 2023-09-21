import React from 'react';
import DraggableFlatList from 'react-native-draggable-flatlist';
import {FlatList} from 'react-native-gesture-handler';
import type {DraggableListProps} from './types';

function DraggableList<T>({renderClone, shouldUsePortal, ...viewProps}: DraggableListProps<T>, ref: React.ForwardedRef<FlatList<T>>) {
    return (
        <DraggableFlatList
            ref={ref}
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...viewProps}
        />
    );
}

DraggableList.displayName = 'DraggableList';

export default React.forwardRef(DraggableList);
