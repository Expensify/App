import type {DragEndEvent} from '@dnd-kit/core';
import {closestCenter, DndContext, KeyboardSensor, PointerSensor, useSensor, useSensors} from '@dnd-kit/core';
import {restrictToParentElement, restrictToVerticalAxis} from '@dnd-kit/modifiers';
import {arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy} from '@dnd-kit/sortable';
import React, {Fragment, useCallback, useMemo} from 'react';
// eslint-disable-next-line no-restricted-imports
import type {ScrollView as RNScrollView} from 'react-native';
import ScrollView from '@components/ScrollView';
import useArrowKeyFocusManager from '@hooks/useArrowKeyFocusManager';
import useKeyboardShortcut from '@hooks/useKeyboardShortcut';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';
import SortableItem from './SortableItem';
import type DraggableListProps from './types';
import {getDraggableItemState} from './types';

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
    onSelectRow,
    isKeyboardActive = true,
    // eslint-disable-next-line @typescript-eslint/naming-convention
    ListFooterComponent,
    disableScroll,
    ref,
}: DraggableListProps<T> & {ref?: React.ForwardedRef<RNScrollView>}) {
    const styles = useThemeStyles();

    const items = data.map((item, index) => {
        return keyExtractor(item, index);
    });

    const disabledArrowKeyIndexes = data.flatMap((item, index) => (getDraggableItemState(item).isDisabled ? [index] : []));

    const [focusedIndex, setFocusedIndex] = useArrowKeyFocusManager({
        initialFocusedIndex: -1,
        maxIndex: data.length - 1,
        disabledIndexes: disabledArrowKeyIndexes,
        isActive: isKeyboardActive,
    });

    const selectFocusedOption = useCallback(() => {
        const focusedItem = data.at(focusedIndex);
        if (focusedItem && onSelectRow) {
            onSelectRow(focusedItem);
        }
    }, [data, focusedIndex, onSelectRow]);

    useKeyboardShortcut(CONST.KEYBOARD_SHORTCUTS.ENTER, selectFocusedOption, {
        isActive: isKeyboardActive && focusedIndex >= 0 && !!onSelectRow,
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
            setFocusedIndex(-1);
        }
    };

    const sortableItems = useMemo(
        () =>
            data.map((item, index) => {
                const key = keyExtractor(item, index);
                const {isDragDisabled, isDisabled: isItemDisabled} = getDraggableItemState(item);
                const isFocused = index === focusedIndex && !isItemDisabled;

                const renderedItem = renderItem({
                    item,
                    getIndex: () => index,
                    isActive: false,
                    drag: () => {},
                });

                const itemWithFocus = React.isValidElement(renderedItem) ? React.cloneElement(renderedItem, {isFocused} as React.Attributes) : renderedItem;

                return (
                    <SortableItem
                        id={key}
                        key={key}
                        disabled={isDragDisabled}
                        isFocused={isFocused}
                        isItemDisabled={isItemDisabled}
                    >
                        {itemWithFocus}
                    </SortableItem>
                );
            }),
        [data, focusedIndex, keyExtractor, renderItem],
    );

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: minimumActivationDistance,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
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
