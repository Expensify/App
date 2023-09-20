import React, {useCallback} from 'react';
import {DragDropContext, Droppable, Draggable, type OnDragEndResponder, type OnDragUpdateResponder} from 'react-beautiful-dnd';
import {ScrollView} from 'react-native';
import useDraggableInPortal from './useDraggableInPortal';
import type {DraggableListProps, DraggableListType} from './types';
import styles from '../../styles/styles';

type ReorderParams<T> = {
    list: T[];
    startIndex: number;
    endIndex: number;
};

// Function to help us with reordering the result
const reorder = <T,>({list, startIndex, endIndex}: ReorderParams<T>): T[] => {
    const result = Array.from(list);
    const [removed] = result.splice(startIndex, 1);

    if (removed) {
        result.splice(endIndex, 0, removed);
    }

    return result;
};

function DraggableList<T>(
    {
        data = [],
        renderItem,
        keyExtractor,
        onDragEnd: onDragEndCallback,
        onDragBegin,
        onPlaceholderIndexChange,
        renderClone,
        shouldUsePortal = false,
        // eslint-disable-next-line @typescript-eslint/naming-convention
        ListFooterComponent,
    }: DraggableListProps<T>,
    ref: React.ForwardedRef<ScrollView>,
) {
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
        <ScrollView
            ref={ref}
            style={styles.flex1}
        >
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
                    )}
                </Droppable>
            </DragDropContext>
            {ListFooterComponent}
        </ScrollView>
    );
}

DraggableList.displayName = 'DraggableList';

// We have to assert the type here because we use generic forwrded ref
// https://fettblog.eu/typescript-react-generic-forward-refs/#option-1%3A-type-assertion
export default React.forwardRef(DraggableList) as DraggableListType;
