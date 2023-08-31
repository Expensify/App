import React, {useCallback} from 'react';
import {DragDropContext, Droppable, Draggable, type OnDragEndResponder, type OnDragUpdateResponder} from 'react-beautiful-dnd';
import {ScrollView} from 'react-native';
import useDraggableInPortal from './useDraggableInPortal';
import type {DraggableListProps, DefaultItemProps} from './types';

type ReorderParams<T> = {
    list: T[];
    startIndex: number;
    endIndex: number;
};

// Function to help us with reordering the result
const reorder = <T,>({list, startIndex, endIndex}: ReorderParams<T>): T[] => {
    const result = Array.from(list);
    const [removed] = result.splice(startIndex, 1);

    if (removed !== undefined) {
        result.splice(endIndex, 0, removed);
    }

    return result;
};

export default function DraggableList<T extends DefaultItemProps>({
    data = [],
    renderItem,
    keyExtractor,
    onDragEnd: onDragEndCallback,
    onDragBegin,
    onPlaceholderIndexChange,
    renderClone,
    shouldUsePortal = false,
    onContentSizeChange,
}: DraggableListProps<T>) {

    /**
     * Function to be called when the user finishes dragging an item
     * It will reorder the list and call the callback function
     * to notify the parent component about the change
     */
    const onDragEnd: OnDragEndResponder = useCallback(
        (result) => {
            // If user dropped the item outside of the list
            if (!result.destination) {
                return;
            }

            const reorderedItems = reorder({
                list: data,
                startIndex: result.source.index,
                endIndex: result.destination.index,
            });

            onDragEndCallback?.({data: reorderedItems});
        },
        [data, onDragEndCallback],
    );

    const onDragUpdate: OnDragUpdateResponder = useCallback(
        (result) => {
            if (!result.destination) {
                return;
            }
            onPlaceholderIndexChange?.(result.destination.index);
        },
        [onPlaceholderIndexChange],
    );

    /**
     * The `react-beautiful-dnd` library uses `position: fixed` to move the dragged item to the top of the screen.
     * But when the parent component uses the `transform` property, the `position: fixed` doesn't work as expected.
     * Since the TabSelector component uses the `transform` property to animate the tab change
     * we have to use portals when any of the parent components use the `transform` property.
     */
    const renderDraggable = useDraggableInPortal({shouldUsePortal});

    return (
        <DragDropContext
            onDragEnd={onDragEnd}
            onDragStart={onDragBegin}
            onDragUpdate={onDragUpdate}
        >
            <Droppable
                droppableId="droppable"
                renderClone={renderClone}
            >
                {(droppableProvided) => (
                    // We use ScrollView to match the native behavior of FlatList
                    <ScrollView onContentSizeChange={onContentSizeChange}>
                        {/* We can't use the react-native View here, because it doesn't support all props */}
                        <div
                            // eslint-disable-next-line react/jsx-props-no-spreading
                            {...droppableProvided.droppableProps}
                            ref={droppableProvided.innerRef}
                        >
                            {data.map((item, index) => {
                                const key = keyExtractor(item, index);
                                return (
                                    <Draggable
                                        key={key}
                                        draggableId={key}
                                        index={index}
                                    >
                                        {renderDraggable((draggableProvided, snapshot) => (
                                            <div
                                                ref={draggableProvided.innerRef}
                                                // eslint-disable-next-line react/jsx-props-no-spreading
                                                {...draggableProvided.draggableProps}
                                                // eslint-disable-next-line react/jsx-props-no-spreading
                                                {...draggableProvided.dragHandleProps}
                                            >
                                                {renderItem({
                                                    item,
                                                    getIndex: () => index,
                                                    isActive: snapshot.isDragging,
                                                    drag: () => {},
                                                })}
                                            </div>
                                        ))}
                                    </Draggable>
                                );
                            })}
                            {droppableProvided.placeholder}
                        </div>
                    </ScrollView>
                )}
            </Droppable>
        </DragDropContext>
    );
}
