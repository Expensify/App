import {useIsFocused} from '@react-navigation/native';
import {useCallback, useEffect, useRef, useState} from 'react';
import {usePopoverActions} from '@components/PopoverProvider';
import type UseDragAndDrop from './types';

const COPY_DROP_EFFECT = 'copy';
const NONE_DROP_EFFECT = 'none';
const DRAG_ENTER_EVENT = 'dragenter';
const DRAG_OVER_EVENT = 'dragover';
const DRAG_LEAVE_EVENT = 'dragleave';
const DROP_EVENT = 'drop';

/**
 * @param dropZone – ref to the dropZone component
 */
const useDragAndDrop: UseDragAndDrop = ({
    dropZone,
    onDrop = () => {},
    shouldAllowDrop = true,
    isDisabled = false,
    shouldAcceptDrop = () => true,
    shouldHandleDragEvent = true,
    shouldStopPropagation = true,
}) => {
    const isFocused = useIsFocused();
    const [isDraggingOver, setIsDraggingOver] = useState(false);
    const {close: closePopover} = usePopoverActions();

    const dragCounter = useRef(0);
    const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        if (isFocused && !isDisabled) {
            return;
        }
        setIsDraggingOver(false);
        dragCounter.current = 0;
        if (debounceTimeoutRef.current) {
            clearTimeout(debounceTimeoutRef.current);
            debounceTimeoutRef.current = null;
        }
    }, [isFocused, isDisabled]);

    const handleDragEvent = useCallback(
        (event: DragEvent) => {
            if (!shouldHandleDragEvent) {
                return;
            }

            const shouldAcceptThisDrop = shouldAllowDrop && shouldAcceptDrop(event);

            if (shouldAcceptThisDrop && event.type === DRAG_ENTER_EVENT) {
                closePopover();
            }

            const effect = shouldAcceptThisDrop ? COPY_DROP_EFFECT : NONE_DROP_EFFECT;

            if (event.dataTransfer) {
                // eslint-disable-next-line no-param-reassign
                event.dataTransfer.dropEffect = effect;
                // eslint-disable-next-line no-param-reassign
                event.dataTransfer.effectAllowed = effect;
            }
        },
        [shouldHandleDragEvent, shouldAllowDrop, shouldAcceptDrop, closePopover],
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
            if (shouldStopPropagation) {
                event.stopPropagation();
            }

            // Clear any existing debounce timeout
            if (debounceTimeoutRef.current) {
                clearTimeout(debounceTimeoutRef.current);
                debounceTimeoutRef.current = null;
            }

            switch (event.type) {
                case DRAG_OVER_EVENT:
                    handleDragEvent(event);
                    break;
                case DRAG_ENTER_EVENT:
                    handleDragEvent(event);
                    dragCounter.current += 1;
                    if (dragCounter.current === 1 && !isDraggingOver) {
                        setIsDraggingOver(true);
                    }
                    break;
                case DRAG_LEAVE_EVENT:
                    dragCounter.current -= 1;
                    if (dragCounter.current <= 0) {
                        dragCounter.current = 0;
                        // Add small debounce to prevent rapid flickering
                        debounceTimeoutRef.current = setTimeout(() => {
                            setIsDraggingOver(false);
                        }, 50);
                    }
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
        [isFocused, isDisabled, shouldAcceptDrop, shouldStopPropagation, handleDragEvent, isDraggingOver, onDrop],
    );

    useEffect(() => {
        if (!dropZone.current) {
            return;
        }

        const dropZoneRef = dropZone.current;

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
};

export default useDragAndDrop;
