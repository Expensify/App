import {useSortable} from '@dnd-kit/sortable';
import {CSS} from '@dnd-kit/utilities';
import React, {useEffect, useRef} from 'react';
import type {SortableItemProps} from './types';

function SortableItem({id, children, disabled = false, isFocused = false, isItemDisabled = false}: SortableItemProps) {
    const {attributes, listeners, setNodeRef, transform, transition} = useSortable({id, disabled});
    const itemRef = useRef<HTMLDivElement>(null);

    const tabIndex = isItemDisabled ? -1 : 0;

    useEffect(() => {
        if (!isFocused || !itemRef.current) {
            return;
        }
        itemRef.current.focus();
    }, [isFocused]);

    const style = {
        touchAction: 'none',
        transform: CSS.Transform.toString(transform),
        transition,
        outline: 'none',
    };

    return (
        <div
            ref={(node) => {
                setNodeRef(node);
                itemRef.current = node;
            }}
            style={style}
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...attributes}
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...(disabled ? {} : listeners)}
            role="option"
            aria-selected={isFocused}
            tabIndex={tabIndex}
        >
            {children}
        </div>
    );
}

export default SortableItem;
