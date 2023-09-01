import React from 'react';
import DraggableFlatList from 'react-native-draggable-flatlist';
import type {DraggableListProps} from './types';

function DraggableList<T>({renderClone, shouldUsePortal, ...viewProps}: DraggableListProps<T>) {
    // eslint-disable-next-line react/jsx-props-no-spreading
    return <DraggableFlatList {...viewProps} />;
}

DraggableList.displayName = 'DraggableList';

export default DraggableList;
