import type {DragEndEvent} from '@dnd-kit/core';
import {closestCenter, DndContext, KeyboardSensor, PointerSensor, useSensor, useSensors} from '@dnd-kit/core';
import {restrictToParentElement, restrictToVerticalAxis} from '@dnd-kit/modifiers';
import {arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy} from '@dnd-kit/sortable';
import {useIsFocused} from '@react-navigation/native';
import React, {useEffect, useId, useRef, useState} from 'react';
// eslint-disable-next-line no-restricted-imports
import type {ScrollView as RNScrollView} from 'react-native';
import ScrollView from '@components/ScrollView';
import useArrowKeyFocusManager from '@hooks/useArrowKeyFocusManager';
import useKeyboardShortcut from '@hooks/useKeyboardShortcut';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';
import SortableItem from './SortableItem';
import type DraggableListProps from './types';

type DraggableItemState = {
    isDragDisabled: boolean;
    isDisabled: boolean;
};

function getDraggableItemState(item: unknown): DraggableItemState {
    if (!item || typeof item !== 'object') {
        return {isDragDisabled: false, isDisabled: false};
    }

    return {
        isDragDisabled: 'isDragDisabled' in item && !!item.isDragDisabled,
        isDisabled: 'isDisabled' in item && !!item.isDisabled,
    };
}

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
    // eslint-disable-next-line @typescript-eslint/naming-convention
    ListFooterComponent,
    disableScroll,
    ref,
}: DraggableListProps<T> & {ref?: React.ForwardedRef<RNScrollView>}) {
    const styles = useThemeStyles();
    const isFocused = useIsFocused();
    const containerRef = useRef<HTMLDivElement>(null);
    const [hasFocus, setHasFocus] = useState(false);
    const [hasBeenFocused, setHasBeenFocused] = useState(false);

    // Arrow keys are active if:
    // 1. The screen is focused AND focus hasn't entered+left the container yet (initial page state), OR
    // 2. The container currently has DOM focus
    const isArrowKeyActive = hasFocus || (isFocused && !hasBeenFocused);

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
            document.dispatchEvent(new KeyboardEvent('keydown', {key: 'Escape', code: 'Escape', bubbles: true, cancelable: true}));
        };
    }, []);

    const items = data.map((item, index) => {
        return keyExtractor(item, index);
    });

    const disabledArrowKeyIndexes = data.flatMap((item, index) => (getDraggableItemState(item).isDisabled ? [index] : []));

    const [focusedIndex, setFocusedIndex] = useArrowKeyFocusManager({
        initialFocusedIndex: -1,
        maxIndex: data.length - 1,
        disabledIndexes: disabledArrowKeyIndexes,
        isActive: isArrowKeyActive,
        disableCyclicTraversal: true,
    });

    useEffect(() => {
        const container = containerRef.current;
        if (!container) {
            return;
        }
        const handleFocusIn = () => {
            setHasBeenFocused(true);
            setHasFocus(true);
        };
        const handleFocusOut = (event: FocusEvent) => {
            if (event.relatedTarget instanceof Node && container.contains(event.relatedTarget)) {
                return;
            }
            setHasFocus(false);
            // When relatedTarget is null the focused element was destroyed by a React re-render.
            // Preserve focusedIndex so prevItemsRef can track the item to its new position.
            if (event.relatedTarget) {
                setFocusedIndex(-1);
            }
        };
        container.addEventListener('focusin', handleFocusIn);
        container.addEventListener('focusout', handleFocusOut);
        return () => {
            container.removeEventListener('focusin', handleFocusIn);
            container.removeEventListener('focusout', handleFocusOut);
        };
    }, [setFocusedIndex]);

    // Follow focus through data reorders — focus should track the item, not stay at the index.
    const prevItemsRef = useRef<string[]>(items);
    useEffect(() => {
        const prevItems = prevItemsRef.current;
        prevItemsRef.current = items;

        if (focusedIndex < 0 || focusedIndex >= prevItems.length) {
            return;
        }

        const focusedKey = prevItems.at(focusedIndex);
        if (!focusedKey || (focusedIndex < items.length && items.at(focusedIndex) === focusedKey)) {
            return;
        }

        const newIndex = items.indexOf(focusedKey);
        if (newIndex >= 0 && newIndex !== focusedIndex) {
            setFocusedIndex(newIndex);
        }
    }, [items, focusedIndex, setFocusedIndex]);

    useEffect(() => {
        if (focusedIndex <= data.length - 1) {
            return;
        }
        setFocusedIndex(Math.max(data.length - 1, -1));
    }, [data.length, focusedIndex, setFocusedIndex]);

    const selectFocusedOption = () => {
        const focusedItem = data.at(focusedIndex);
        if (focusedItem && onSelectRow) {
            onSelectRow(focusedItem);
        }
    };

    useKeyboardShortcut(CONST.KEYBOARD_SHORTCUTS.ENTER, selectFocusedOption, {
        isActive: hasFocus && focusedIndex >= 0 && !!onSelectRow,
    });

    useKeyboardShortcut(CONST.KEYBOARD_SHORTCUTS.SPACE, selectFocusedOption, {
        isActive: hasFocus && focusedIndex >= 0 && !!onSelectRow,
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
            setFocusedIndex(-1);
        }
    };

    const onDragCancel = () => {
        isDraggingRef.current = false;
    };

    const sortableItems = data.map((item, index) => {
        const key = keyExtractor(item, index);
        const {isDragDisabled, isDisabled: isItemDisabled} = getDraggableItemState(item);
        const isItemFocused = index === focusedIndex && !isItemDisabled;

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
                start: ['Space'],
                cancel: ['Escape'],
                end: ['Space'],
            },
        }),
    );

    const content = (
        <>
            <div ref={containerRef}>
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
