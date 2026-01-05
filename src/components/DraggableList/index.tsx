import type {DragEndEvent} from '@dnd-kit/core';
import {closestCenter, DndContext, PointerSensor, useSensor} from '@dnd-kit/core';
import {restrictToParentElement, restrictToVerticalAxis} from '@dnd-kit/modifiers';
import {arrayMove, SortableContext, verticalListSortingStrategy} from '@dnd-kit/sortable';
import React, {Fragment, useMemo} from 'react';
// eslint-disable-next-line no-restricted-imports
import type {ScrollView as RNScrollView} from 'react-native';
import ScrollView from '@components/ScrollView';
import useArrowKeyFocusManager from '@hooks/useArrowKeyFocusManager';
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

    const items = data.map((item, index) => {
        return keyExtractor(item, index);
    });

    const disabledArrowKeyIndexes = useMemo(
        () =>
            data.reduce<number[]>((acc, item, index) => {
                // For keyboard navigation, skip items that are truly disabled (isDisabled), not just drag-disabled (isDragDisabled)
                if ((item as {isDisabled?: boolean})?.isDisabled) {
                    acc.push(index);
                }
                return acc;
            }, []),
        [data],
    );

    const [focusedIndex] = useArrowKeyFocusManager({
        initialFocusedIndex: -1,
        maxIndex: data.length - 1,
        disabledIndexes: disabledArrowKeyIndexes,
        isActive: true,
    });

    /**
     * Function to be called when the user finishes dragging an item
     * It will reorder the list and call the callback function
     * to notify the parent component about the change
     */
    const onDragEnd = (event: DragEndEvent) => {
        const {active, over} = event;

        if (over !== null && active.id !== over.id) {
            const oldIndex = items.indexOf(active.id.toString());
            const newIndex = items.indexOf(over.id.toString());

            const reorderedItems = arrayMove(data, oldIndex, newIndex);
            onDragEndCallback?.({data: reorderedItems});
        }
    };

    const sortableItems = data.map((item, index) => {
        const key = keyExtractor(item, index);
        const isDragDisabled = (item as {isDragDisabled?: boolean})?.isDragDisabled ?? false;
        const isFocused = index === focusedIndex;

        const renderedItem = renderItem({
            item,
            getIndex: () => index,
            isActive: false,
            drag: () => {},
        });

        // Clone the rendered item and inject isFocused prop for hover styling
        const itemWithFocus = React.isValidElement(renderedItem) ? React.cloneElement(renderedItem, {isFocused} as React.Attributes) : renderedItem;

        return (
            <SortableItem
                id={key}
                key={key}
                disabled={isDragDisabled}
                isFocused={isFocused}
            >
                {itemWithFocus}
            </SortableItem>
        );
    });

    const sensors = [
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: minimumActivationDistance,
            },
        }),
    ];

    const Container = disableScroll ? Fragment : ScrollView;

    return (
        <Container
            ref={ref}
            style={styles.flex1}
            contentContainerStyle={styles.flex1}
        >
            <div>
                <DndContext
                    onDragEnd={onDragEnd}
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
