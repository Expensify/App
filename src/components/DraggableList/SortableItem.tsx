import {useSortable} from '@dnd-kit/sortable';
import {CSS} from '@dnd-kit/utilities';
import React from 'react';
import type {SortableItemProps} from './types';

function SortableItem({id, children, disabled = false}: SortableItemProps) {
    const {attributes, listeners, setNodeRef, transform, transition, isDragging} = useSortable({id, disabled});

    const style = {
        touchAction: 'none',
        transform: CSS.Transform.toString(transform),
        transition,
    };

    // Prevent Enter key from reaching MenuItem when dragging to avoid navigation conflicts
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (isDragging && e.key === 'Enter') {
            e.preventDefault();
            e.stopPropagation();
        }
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            // Use capture phase to intercept Enter before MenuItem handles it
            onKeyDownCapture={handleKeyDown}
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...attributes}
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...(disabled ? {} : listeners)}
            // Override dnd-kit's tabIndex to prevent double focus (outer wrapper + inner MenuItem)
            tabIndex={-1}
        >
            {children}
        </div>
    );
}

export default SortableItem;
