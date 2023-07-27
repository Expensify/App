import _ from 'underscore';
import {useEffect, useRef, useState, useCallback} from 'react';
import {useIsFocused} from '@react-navigation/native';

const COPY_DROP_EFFECT = 'copy';
const NONE_DROP_EFFECT = 'none';
const DRAG_ENTER_EVENT = 'dragenter';
const DRAG_OVER_EVENT = 'dragover';
const DRAG_LEAVE_EVENT = 'dragleave';
const DROP_EVENT = 'drop';

export default function useDragAndDrop({dropZoneElement, onDrop = () => {}, shouldAllowDrop = true, isDisabled = false, shouldAcceptDrop = () => true}) {
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

    const onDropRef = useRef(onDrop);
    onDropRef.current = onDrop;
    const onDropCallback = useCallback((event) => {
        if (!_.isFunction(onDropRef.current)) {
            return;
        }
        onDropRef.current(event);
    }, []);

    const setDropEffect = useCallback(
        (event) => {
            // eslint-disable-next-line no-param-reassign
            event.dataTransfer.dropEffect = shouldAllowDrop && shouldAcceptDrop(event) ? COPY_DROP_EFFECT : NONE_DROP_EFFECT;
        },
        [shouldAllowDrop, shouldAcceptDrop],
    );

    /**
     * Handles all types of drag-N-drop events on the drop zone associated with composer
     *
     * @param {Object} event native Event
     */
    const dropZoneDragHandler = useCallback(
        (event) => {
            if (!isFocused || isDisabled) {
                return;
            }

            event.preventDefault();

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
                    onDropCallback(event);
                    break;
                default:
                    break;
            }
        },
        [isFocused, isDisabled, setDropEffect, isDraggingOver, onDropCallback],
    );

    useEffect(() => {
        if (!dropZoneElement) {
            return;
        }

        // Note that the dragover event needs to be called with `event.preventDefault` in order for the drop event to be fired:
        // https://stackoverflow.com/questions/21339924/drop-event-not-firing-in-chrome
        dropZoneElement.addEventListener(DRAG_OVER_EVENT, dropZoneDragHandler);
        dropZoneElement.addEventListener(DRAG_ENTER_EVENT, dropZoneDragHandler);
        dropZoneElement.addEventListener(DRAG_LEAVE_EVENT, dropZoneDragHandler);
        dropZoneElement.addEventListener(DROP_EVENT, dropZoneDragHandler);
        return () => {
            if (!dropZoneElement) {
                return;
            }

            dropZoneElement.removeEventListener(DRAG_OVER_EVENT, dropZoneDragHandler);
            dropZoneElement.removeEventListener(DRAG_ENTER_EVENT, dropZoneDragHandler);
            dropZoneElement.removeEventListener(DRAG_LEAVE_EVENT, dropZoneDragHandler);
            dropZoneElement.removeEventListener(DROP_EVENT, dropZoneDragHandler);
        };
    }, [dropZoneElement, dropZoneDragHandler]);

    return {isDraggingOver};
}
