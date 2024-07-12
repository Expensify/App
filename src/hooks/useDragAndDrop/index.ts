import {useIsFocused} from '@react-navigation/native';
import {useCallback, useContext, useEffect, useRef, useState} from 'react';
import {PopoverContext} from '@components/PopoverProvider';
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
const useDragAndDrop: UseDragAndDrop = ({dropZone, onDrop = () => {}, shouldAllowDrop = true, isDisabled = false, shouldAcceptDrop = () => true}) => {
    const isFocused = useIsFocused();
    const [isDraggingOver, setIsDraggingOver] = useState(false);
    const {close: closePopover} = useContext(PopoverContext);

    const enterTarget = useRef<EventTarget | null>(null);

    useEffect(() => {
        if (isFocused && !isDisabled) {
            return;
        }
        setIsDraggingOver(false);
    }, [isFocused, isDisabled]);

    const handleDragEvent = useCallback(
        (event: DragEvent) => {
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
        [shouldAllowDrop, shouldAcceptDrop, closePopover],
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
                    handleDragEvent(event);
                    break;
                case DRAG_ENTER_EVENT:
                    handleDragEvent(event);
                    enterTarget.current = event.target;
                    if (isDraggingOver) {
                        return;
                    }
                    setIsDraggingOver(true);
                    break;
                case DRAG_LEAVE_EVENT:
                    if (!isDraggingOver) {
                        return;
                    }
                    // This is necessary because dragging over children will cause dragleave to execute on the parent.
                    if (enterTarget.current !== event.target) {
                        return;
                    }

                    setIsDraggingOver(false);
                    break;
                case DROP_EVENT:
                    setIsDraggingOver(false);
                    onDrop(event);
                    break;
                default:
                    break;
            }
        },
        [isFocused, isDisabled, shouldAcceptDrop, isDraggingOver, onDrop, handleDragEvent],
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
