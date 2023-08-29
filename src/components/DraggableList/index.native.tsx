import React from 'react';
import DraggableFlatList from 'react-native-draggable-flatlist';
import _ from 'lodash';
import type {DefaultItemProps, DraggableListProps} from './types';

export default function DraggableList<T extends DefaultItemProps>({...props}: DraggableListProps<T>) {
    const viewProps = _.omit(props, ['renderClone', 'shouldUsePortal']);
    return <DraggableFlatList {...viewProps} />;
}
