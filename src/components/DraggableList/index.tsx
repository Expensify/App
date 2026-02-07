import type {DragEndEvent} from '@dnd-kit/core';
import {closestCenter, DndContext, KeyboardSensor, PointerSensor, useSensor, useSensors} from '@dnd-kit/core';
import {restrictToParentElement, restrictToVerticalAxis} from '@dnd-kit/modifiers';
import {arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy} from '@dnd-kit/sortable';
import React, {Fragment, useEffect, useRef, useState} from 'react';
// eslint-disable-next-line no-restricted-imports
import type {ScrollView as RNScrollView} from 'react-native';
import ScrollView from '@components/ScrollView';
import useThemeStyles from '@hooks/useThemeStyles';
import SortableItem from './SortableItem';
import type DraggableListProps from './types';

const minimumActivationDistance = 5; // pointer must move at least this much before starting to drag

/**
 * Draggable (vertical) list using dnd-kit. Dragging is restricted to the vertical axis only
 *
 */
function DraggableList<T>({
    data = [],
    renderItem,
    keyExtractor,
    onDragEnd: onDragEndCallback,
    // eslint-disable-next-line @typescript-eslint/naming-convention
    ListFooterComponent,
    disableScroll,
    ref,
}: DraggableListProps<T> & {ref?: React.ForwardedRef<RNScrollView>}) {
    const styles = useThemeStyles();

    // Generate a unique ID per mount to ensure DndContext state resets when component remounts
    const [instanceId] = useState(() => `${Date.now()}-${Math.random().toString(36).slice(2)}`);

    // Track if a drag is currently active to avoid dispatching global Escape when not needed
    const isDraggingRef = useRef(false);

    // Cancel any active keyboard drag when the component unmounts to prevent ghost drag state
    useEffect(() => {
        return () => {
            if (typeof document === 'undefined' || !isDraggingRef.current) {
                return;
            }
            document.dispatchEvent(new KeyboardEvent('keydown', {key: 'Escape', code: 'Escape', bubbles: true, cancelable: true}));
        };
    }, []);

    const items = data.map((item, index) => {
        return keyExtractor(item, index);
    });

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
        }
    };

    const onDragCancel = () => {
        isDraggingRef.current = false;
    };

    const sortableItems = data.map((item, index) => {
        const key = keyExtractor(item, index);
        // Check if item has a disabled property for dragging
        const isDisabled = typeof item === 'object' && item !== null && 'isDragDisabled' in item ? !!(item as {isDragDisabled?: boolean}).isDragDisabled : false;
        return (
            <SortableItem
                id={key}
                key={key}
                disabled={isDisabled}
            >
                {renderItem({
                    item,
                    getIndex: () => index,
                    isActive: false,
                    drag: () => {},
                })}
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
                start: ['Space'],
                cancel: ['Escape'],
                end: ['Space'],
            },
        }),
    );

    const Container = disableScroll ? Fragment : ScrollView;

    return (
        <Container
            ref={ref}
            style={styles.flex1}
            contentContainerStyle={styles.flex1}
        >
            <div>
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
        </Container>
    );
}

export default DraggableList;
