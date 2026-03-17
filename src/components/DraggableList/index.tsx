import type {DragEndEvent} from '@dnd-kit/core';
import {closestCenter, DndContext, KeyboardSensor, PointerSensor, useSensor, useSensors} from '@dnd-kit/core';
import {restrictToParentElement, restrictToVerticalAxis} from '@dnd-kit/modifiers';
import {arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy} from '@dnd-kit/sortable';
import React, {useEffect, useId, useRef} from 'react';
// eslint-disable-next-line no-restricted-imports
import type {ScrollView as RNScrollView} from 'react-native';
import ScrollView from '@components/ScrollView';
import useListKeyboardNav from '@hooks/useListKeyboardNav';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';
import SortableItem from './SortableItem';
import type DraggableListProps from './types';

const minimumActivationDistance = 5; // pointer must move at least this much before starting to drag

/**
 * Draggable (vertical) list using dnd-kit. Dragging is restricted to the vertical axis only.
 *
 * Supports two modes:
 * - **Uncontrolled** (default): manages its own keyboard navigation internally
 * - **Controlled**: when `focusedIndex` prop is provided, skips internal keyboard nav
 *   and uses the external value. The parent is responsible for arrow keys, Enter/Space, and focus tracking.
 */
function DraggableList<T>({
    data = [],
    renderItem,
    keyExtractor,
    onDragEnd: onDragEndCallback,
    onSelectRow,
    isItemDragDisabled,
    isItemDisabled,
    ListFooterComponent,
    disableScroll,
    focusedIndex: controlledFocusedIndex,
    ref,
}: DraggableListProps<T> & {ref?: React.ForwardedRef<RNScrollView>}) {
    const styles = useThemeStyles();
    const isControlled = controlledFocusedIndex !== undefined;
    const hasKeyboardNav = !isControlled && !!onSelectRow;
    const containerRef = useRef<HTMLDivElement>(null);

    // Unique ID per mount to ensure DndContext state resets when component remounts
    const instanceId = useId();

    // Track if a drag is currently active to avoid dispatching global Escape when not needed
    const isDraggingRef = useRef(false);

    // Cancel any active keyboard drag when the component unmounts to prevent ghost drag state
    useEffect(() => {
        return () => {
            if (typeof document === 'undefined' || !isDraggingRef.current) {
                return;
            }
            document.dispatchEvent(
                new KeyboardEvent('keydown', {key: CONST.KEYBOARD_SHORTCUTS.ESCAPE.shortcutKey, code: CONST.KEYBOARD_SHORTCUTS.ESCAPE.shortcutKey, bubbles: true, cancelable: true}),
            );
        };
    }, []);

    const items = data.map((item, index) => {
        return keyExtractor(item, index);
    });

    const disabledArrowKeyIndexes = isItemDisabled ? data.flatMap((item, index) => (isItemDisabled(item) ? [index] : [])) : [];

    const {focusedIndex: internalFocusedIndex, setFocusedIndex: setInternalFocusedIndex} = useListKeyboardNav({
        containerRef,
        isActive: hasKeyboardNav,
        itemKeys: items,
        disabledIndexes: disabledArrowKeyIndexes,
    });

    const activeFocusedIndex = isControlled ? controlledFocusedIndex : internalFocusedIndex;

    const onDragStart = () => {
        isDraggingRef.current = true;
    };

    /**
     * Function to be called when the user finishes dragging an item
     * It will reorder the list and call the callback function
     * to notify the parent component about the change
     */
    const onDragEnd = (event: DragEndEvent) => {
        isDraggingRef.current = false;
        const {active, over} = event;

        if (over !== null && active.id !== over.id) {
            const oldIndex = items.indexOf(active.id.toString());
            const newIndex = items.indexOf(over.id.toString());

            const reorderedItems = arrayMove(data, oldIndex, newIndex);
            onDragEndCallback?.({data: reorderedItems});
            if (!isControlled) {
                setInternalFocusedIndex(-1);
            }
        }
    };

    const onDragCancel = () => {
        isDraggingRef.current = false;
    };

    const sortableItems = data.map((item, index) => {
        const key = keyExtractor(item, index);
        const isDragDisabled = isItemDragDisabled?.(item) ?? false;
        const isDisabled = isItemDisabled?.(item) ?? false;
        const isItemFocused = index === activeFocusedIndex && !isDisabled;

        const renderedItem = renderItem({
            item,
            getIndex: () => index,
            isActive: false,
            drag: () => {},
            isFocused: isItemFocused,
        });

        return (
            <SortableItem
                id={key}
                key={key}
                disabled={isDragDisabled}
                isFocused={isItemFocused}
            >
                {renderedItem}
            </SortableItem>
        );
    });

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: minimumActivationDistance,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
            keyboardCodes: {
                start: [CONST.KEYBOARD_SHORTCUTS.SPACE.shortcutKey],
                cancel: [CONST.KEYBOARD_SHORTCUTS.ESCAPE.shortcutKey],
                end: [CONST.KEYBOARD_SHORTCUTS.SPACE.shortcutKey],
            },
        }),
    );

    const content = (
        <>
            <div ref={isControlled ? undefined : containerRef}>
                <DndContext
                    key={instanceId}
                    onDragStart={onDragStart}
                    onDragEnd={onDragEnd}
                    onDragCancel={onDragCancel}
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    modifiers={[restrictToParentElement, restrictToVerticalAxis]}
                >
                    <SortableContext
                        items={items}
                        strategy={verticalListSortingStrategy}
                    >
                        {sortableItems}
                    </SortableContext>
                </DndContext>
            </div>
            {ListFooterComponent}
        </>
    );

    if (disableScroll) {
        return content;
    }

    return (
        <ScrollView
            ref={ref}
            style={styles.flex1}
            contentContainerStyle={styles.flex1}
        >
            {content}
        </ScrollView>
    );
}

export default DraggableList;
