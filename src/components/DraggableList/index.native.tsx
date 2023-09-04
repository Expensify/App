import React from 'react';
import DraggableFlatList from 'react-native-draggable-flatlist';
import {FlatList} from 'react-native-gesture-handler';
import type {DraggableListProps, DraggableListType} from './types';

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

// We have to assert the type here because we use generic forwrded ref
// https://fettblog.eu/typescript-react-generic-forward-refs/#option-1%3A-type-assertion
export default React.forwardRef(DraggableList) as DraggableListType;
