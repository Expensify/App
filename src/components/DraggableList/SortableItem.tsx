/* eslint-disable react/jsx-props-no-spreading */
import {useSortable} from '@dnd-kit/sortable';
import {CSS} from '@dnd-kit/utilities';
import React from 'react';
import type {SortableItemProps} from './types';

function SortableItem({id, children}: SortableItemProps) {
    const {attributes, listeners, setNodeRef, transform, transition} = useSortable({id: props.id});

    const style = {
        touchAction: 'none',
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        // eslint-disable-next-line react/jsx-props-no-spreading
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
        >
            {props.children}
        </div>
    );
}

export default SortableItem;
