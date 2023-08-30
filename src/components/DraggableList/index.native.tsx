import React from 'react';
import DraggableFlatList from 'react-native-draggable-flatlist';
import type {DefaultItemProps, DraggableListProps} from './types';

export default function DraggableList<T extends DefaultItemProps>({renderClone, shouldUsePortal, ...viewProps}: DraggableListProps<T>) {
    // eslint-disable-next-line react/jsx-props-no-spreading
    return <DraggableFlatList {...viewProps} />;
}
