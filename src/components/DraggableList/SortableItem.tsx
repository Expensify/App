import {useSortable} from '@dnd-kit/sortable';
import {CSS} from '@dnd-kit/utilities';
import type {KeyboardEvent} from 'react';
import React, {useCallback, useEffect, useRef} from 'react';
import type {SortableItemProps} from './types';

function SortableItem({id, children, disabled = false}: SortableItemProps) {
    const {attributes, listeners, setNodeRef, transform, transition} = useSortable({id, disabled});
    const contentRef = useRef<HTMLDivElement>(null);

    const style = {
        touchAction: 'none',
        transform: CSS.Transform.toString(transform),
        transition,
    };

    // Remove inner focusable elements from tab order
    useEffect(() => {
        if (contentRef.current) {
            const focusableElements = contentRef.current.querySelectorAll<HTMLElement>(
                '[tabindex="0"], [role="button"], [role="menuitem"], button:not([tabindex="-1"]), a:not([tabindex="-1"])',
            );
            focusableElements.forEach((el) => {
                el.tabIndex = -1;
            });
        }
    });

    // Handle keyboard: merge dnd-kit's handler with Enter for activation
    const handleKeyDown = useCallback(
        (e: KeyboardEvent<HTMLDivElement>) => {
            // Let dnd-kit handle Space for drag operations
            if (listeners?.onKeyDown) {
                (listeners.onKeyDown as (event: KeyboardEvent<HTMLElement>) => void)(e);
            }

            // Handle Enter to activate the inner element (e.g., open waypoint editor)
            if (e.key === 'Enter' && !e.defaultPrevented) {
                const innerElement = contentRef.current?.querySelector<HTMLElement>('[role="menuitem"]');
                if (innerElement) {
                    innerElement.click();
                }
            }
        },
        [listeners],
    );

    return (
        <div
            ref={setNodeRef}
            style={style}
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...attributes}
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...(disabled ? {} : {...listeners, onKeyDown: handleKeyDown})}
        >
            <div
                ref={contentRef}
                style={{outline: 'none'}}
            >
                {children}
            </div>
        </div>
    );
}

export default SortableItem;
