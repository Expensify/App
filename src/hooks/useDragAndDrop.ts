import {useIsFocused} from '@react-navigation/native';
import React, {useCallback, useEffect, useRef, useState} from 'react';
import {View} from 'react-native';

const COPY_DROP_EFFECT = 'copy';
const NONE_DROP_EFFECT = 'none';
const DRAG_ENTER_EVENT = 'dragenter';
const DRAG_OVER_EVENT = 'dragover';
const DRAG_LEAVE_EVENT = 'dragleave';
const DROP_EVENT = 'drop';

type DragAndDropParams = {
    dropZone: React.MutableRefObject<HTMLDivElement | View | null>;
    onDrop?: (event: DragEvent) => void;
    shouldAllowDrop?: boolean;
    isDisabled?: boolean;
    shouldAcceptDrop?: (event: DragEvent) => boolean;
};

type DragAndDropOptions = {
    isDraggingOver: boolean;
};

/**
 * @param dropZone – ref to the dropZone component
 */
export default function useDragAndDrop({dropZone, onDrop = () => {}, shouldAllowDrop = true, isDisabled = false, shouldAcceptDrop = () => true}: DragAndDropParams): DragAndDropOptions {
    const isFocused = useIsFocused();
    const [isDraggingOver, setIsDraggingOver] = useState(false);

    // This solution is borrowed from this SO: https://stackoverflow.com/questions/7110353/html5-dragleave-fired-when-hovering-a-child-element
    // This is necessary because dragging over children will cause dragleave to execute on the parent.
    // You can think of this counter as a stack. When a child is hovered over we push an element onto the stack.
    // Then we only process the dragleave event if the count is 0, because it means that the last element (the parent) has been popped off the stack.
    const dragCounter = useRef(0);

    // If this component is out of focus or disabled, reset the drag state back to the default
    useEffect(() => {
        if (isFocused && !isDisabled) {
            return;
        }
        dragCounter.current = 0;
        setIsDraggingOver(false);
    }, [isFocused, isDisabled]);

    const setDropEffect = useCallback(
        (event: DragEvent) => {
            const effect = shouldAllowDrop && shouldAcceptDrop(event) ? COPY_DROP_EFFECT : NONE_DROP_EFFECT;

            if (event.dataTransfer) {
                // eslint-disable-next-line no-param-reassign
                event.dataTransfer.dropEffect = effect;
                // eslint-disable-next-line no-param-reassign
                event.dataTransfer.effectAllowed = effect;
            }
        },
        [shouldAllowDrop, shouldAcceptDrop],
    );

    /**
     * Handles all types of drag-N-drop events on the drop zone associated with composer
     */
    const dropZoneDragHandler = useCallback(
        (event: DragEvent) => {
            if (!isFocused || isDisabled || !shouldAcceptDrop(event)) {
                return;
            }

            event.preventDefault();
            event.stopPropagation();

            switch (event.type) {
                case DRAG_OVER_EVENT:
                    setDropEffect(event);
                    break;
                case DRAG_ENTER_EVENT:
                    dragCounter.current++;
                    setDropEffect(event);
                    if (isDraggingOver) {
                        return;
                    }
                    setIsDraggingOver(true);
                    break;
                case DRAG_LEAVE_EVENT:
                    dragCounter.current--;
                    if (!isDraggingOver || dragCounter.current > 0) {
                        return;
                    }

                    setIsDraggingOver(false);
                    break;
                case DROP_EVENT:
                    dragCounter.current = 0;
                    setIsDraggingOver(false);
                    onDrop(event);
                    break;
                default:
                    break;
            }
        },
        [isFocused, isDisabled, shouldAcceptDrop, setDropEffect, isDraggingOver, onDrop],
    );

    useEffect(() => {
        if (!dropZone.current) {
            return;
        }

        const dropZoneRef = dropZone.current as HTMLDivElement;

        // Note that the dragover event needs to be called with `event.preventDefault` in order for the drop event to be fired:
        // https://stackoverflow.com/questions/21339924/drop-event-not-firing-in-chrome
        dropZoneRef.setAttribute('webkitdirectory', '');
        dropZoneRef.addEventListener(DRAG_OVER_EVENT, dropZoneDragHandler);
        dropZoneRef.addEventListener(DRAG_ENTER_EVENT, dropZoneDragHandler);
        dropZoneRef.addEventListener(DRAG_LEAVE_EVENT, dropZoneDragHandler);
        dropZoneRef.addEventListener(DROP_EVENT, dropZoneDragHandler);
        return () => {
            if (!dropZoneRef) {
                return;
            }
            dropZoneRef.removeAttribute('webkitdirectory');
            dropZoneRef.removeEventListener(DRAG_OVER_EVENT, dropZoneDragHandler);
            dropZoneRef.removeEventListener(DRAG_ENTER_EVENT, dropZoneDragHandler);
            dropZoneRef.removeEventListener(DRAG_LEAVE_EVENT, dropZoneDragHandler);
            dropZoneRef.removeEventListener(DROP_EVENT, dropZoneDragHandler);
        };
    }, [dropZone, dropZoneDragHandler]);

    return {isDraggingOver};
}
