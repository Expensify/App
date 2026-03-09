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

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key !== 'Enter') {
            return;
        }
        if (isDragging) {
            e.preventDefault();
            e.stopPropagation();
            return;
        }
        // Forward Enter to inner button since nested elements are non-tabbable
        const btn = (e.currentTarget as HTMLElement).querySelector<HTMLElement>('button, [role="button"]');
        if (btn) {
            e.preventDefault();
            btn.click();
        }
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            onKeyDownCapture={handleKeyDown}
            // Maintain single tab stop per item (WCAG 1.3.2): when focus lands on a
            // nested interactive element via Tab, pull it back to the sortable wrapper
            // and remove the child from tab order so the next Tab advances correctly.
            onFocus={(e) => {
                for (const element of e.currentTarget.querySelectorAll<HTMLElement>('button, [tabindex]:not([tabindex="-1"])')) {
                    element.tabIndex = -1;
                }
                if (e.target === e.currentTarget) {
                    return;
                }
                e.currentTarget.focus();
            }}
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...attributes}
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...(disabled ? {} : listeners)}
        >
            {children}
        </div>
    );
}

export default SortableItem;
