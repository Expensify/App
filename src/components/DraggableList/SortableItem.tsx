import {useSortable} from '@dnd-kit/sortable';
import {CSS} from '@dnd-kit/utilities';
import React, {useEffect, useLayoutEffect} from 'react';
import CONST from '@src/CONST';
import type {SortableItemProps} from './types';

const PRESSABLE_SELECTOR = '[data-tag="pressable"]';

function SortableItem({id, children, disabled = false, isFocused = false}: SortableItemProps) {
    const {attributes, listeners, setNodeRef, transform, transition, isDragging, node} = useSortable({id, disabled});

    useEffect(() => {
        if (!isFocused || !node.current) {
            return;
        }
        if (!node.current.contains(document.activeElement)) {
            node.current.focus();
        }
        node.current.scrollIntoView({block: 'nearest'});
    }, [isFocused, node]);

    const style = {
        touchAction: 'none',
        transform: CSS.Transform.toString(transform),
        transition,
        outline: 'none',
    };

    // The sortable wrapper is the single Tab stop (tabIndex: 0 via dnd-kit attributes).
    // Inner pressables must be non-focusable to avoid a double Tab stop per item.
    useLayoutEffect(() => {
        for (const el of node.current?.querySelectorAll<HTMLElement>(PRESSABLE_SELECTOR) ?? []) {
            el.setAttribute('tabindex', '-1');
        }
    }, [children, node]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key !== CONST.KEYBOARD_SHORTCUTS.ENTER.shortcutKey) {
            return;
        }

        // Block Enter during active drag
        if (isDragging) {
            e.preventDefault();
            e.stopPropagation();
            return;
        }

        // Forward Enter to the inner pressable for navigation
        const innerPressable = node.current?.querySelector<HTMLElement>(PRESSABLE_SELECTOR);
        if (innerPressable) {
            innerPressable.click();
            e.preventDefault();
            e.stopPropagation();
        }
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            // Use capture phase to intercept Enter before inner MenuItem handles it
            onKeyDownCapture={handleKeyDown}
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
