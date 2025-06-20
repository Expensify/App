import {useSortable} from '@dnd-kit/sortable';
import {CSS} from '@dnd-kit/utilities';
import React from 'react';
import type {SortableItemProps} from './types';

function SortableItem({id, children}: SortableItemProps) {
    const {attributes, listeners, setNodeRef, transform, transition} = useSortable({id});

    const style = {
        touchAction: 'none',
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...attributes}
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...listeners}
        >
            {children}
        </div>
    );
}

export default SortableItem;
