import {useEffect, useRef, useCallback} from 'react';
import _ from 'underscore';
import {useIsFocused} from '@react-navigation/native';
import DragAndDropPropTypes from './dragAndDropPropTypes';
import useEffectOnPageLoad from '../../hooks/useEffectOnPageLoad';
import useWindowDimensions from '../../hooks/useWindowDimensions';

const COPY_DROP_EFFECT = 'copy';
const NONE_DROP_EFFECT = 'none';
const DRAG_ENTER_EVENT = 'dragenter';
const DRAG_OVER_EVENT = 'dragover';
const DRAG_LEAVE_EVENT = 'dragleave';
const DROP_EVENT = 'drop';

/**
 * @param {Event} event – drag event
 * @returns {Boolean}
 */
function shouldAcceptDrop(event) {
    return _.some(event.dataTransfer.types, (type) => type === 'Files');
}

function DragAndDrop({onDragEnter, onDragLeave, onDrop, dropZoneID, activeDropZoneID, children, isDisabled = false}) {
    const isFocused = useIsFocused();
    const {windowWidth, isSmallScreenWidth} = useWindowDimensions();

    const dropZone = useRef(null);
    const dropZoneRect = useRef(null);

    useEffect(() => {
        const dropZoneElement = document.getElementById(dropZoneID);
        if (!dropZoneElement) {
            throw new Error('Error: element specified by dropZoneID not found');
        }
        dropZone.current = dropZoneElement;
    }, [dropZoneID]);

    useEffectOnPageLoad(
        () =>
            _.throttle(() => {
                const boundingClientRect = dropZone.current.getBoundingClientRect();
                dropZoneRect.current = {
                    width: boundingClientRect.width,
                    left: isSmallScreenWidth ? 0 : boundingClientRect.left,
                    right: isSmallScreenWidth ? windowWidth : boundingClientRect.right,
                    top: boundingClientRect.top,
                    bottom: boundingClientRect.bottom,
                };
            }),
        [windowWidth, isSmallScreenWidth],
    );

    /*
     * Last detected drag state on the dropzone -> we start with dragleave since user is not dragging initially.
     * This state is updated when drop zone is left/entered entirely(not taking the children in the account) or entire window is left
     */
    const dropZoneDragState = useRef(DRAG_LEAVE_EVENT);

    // If this component is out of focus or disabled, reset the drag state back to the default
    useEffect(() => {
        if (isFocused && !isDisabled) {
            return;
        }
        dropZoneDragState.current = DRAG_LEAVE_EVENT;
    }, [isFocused, isDisabled]);

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

            if (dropZone.current.contains(event.target) && shouldAcceptDrop(event)) {
                switch (event.type) {
                    case DRAG_OVER_EVENT:
                        // Nothing needed here, just needed to preventDefault in order for the drop event to fire later
                        break;
                    case DRAG_ENTER_EVENT:
                        // Avoid reporting onDragEnter for children views -> not performant
                        if (dropZoneDragState.current === DRAG_LEAVE_EVENT) {
                            dropZoneDragState.current = DRAG_ENTER_EVENT;
                            // eslint-disable-next-line no-param-reassign
                            event.dataTransfer.dropEffect = COPY_DROP_EFFECT;
                            onDragEnter(event);
                        }
                        break;
                    case DRAG_LEAVE_EVENT:
                        if (dropZoneDragState.current === DRAG_ENTER_EVENT) {
                            if (
                                event.clientY <= dropZoneRect.current.top ||
                                event.clientY >= dropZoneRect.current.bottom ||
                                event.clientX <= dropZoneRect.current.left ||
                                event.clientX >= dropZoneRect.current.right ||
                                // Cancel drag when file manager is on top of the drop zone area - works only on chromium
                                (event.target.getAttribute('id') === activeDropZoneID && !event.relatedTarget)
                            ) {
                                dropZoneDragState.current = DRAG_LEAVE_EVENT;
                                onDragLeave(event);
                            }
                        }
                        break;
                    case DROP_EVENT:
                        dropZoneDragState.current = DRAG_LEAVE_EVENT;
                        onDrop(event);
                        break;
                    default:
                        break;
                }
            } else {
                // eslint-disable-next-line no-param-reassign
                event.dataTransfer.dropEffect = NONE_DROP_EFFECT;
            }
        },
        [isFocused, isDisabled, onDragEnter, onDragLeave, activeDropZoneID, onDrop],
    );

    useEffect(() => {
        // Note that the dragover event needs to be called with `event.preventDefault` in order for the drop event to be fired:
        // https://stackoverflow.com/questions/21339924/drop-event-not-firing-in-chrome
        document.addEventListener(DRAG_OVER_EVENT, dropZoneDragHandler);
        document.addEventListener(DRAG_ENTER_EVENT, dropZoneDragHandler);
        document.addEventListener(DRAG_LEAVE_EVENT, dropZoneDragHandler);
        document.addEventListener(DROP_EVENT, dropZoneDragHandler);
        return () => {
            document.removeEventListener(DRAG_OVER_EVENT, dropZoneDragHandler);
            document.removeEventListener(DRAG_ENTER_EVENT, dropZoneDragHandler);
            document.removeEventListener(DRAG_ENTER_EVENT, dropZoneDragHandler);
            document.removeEventListener(DRAG_LEAVE_EVENT, dropZoneDragHandler);
            document.removeEventListener(DROP_EVENT, dropZoneDragHandler);
        };
    }, [dropZoneDragHandler]);

    return children;
}

DragAndDrop.propTypes = DragAndDropPropTypes;
DragAndDrop.displayName = 'DragAndDrop';

export default DragAndDrop;
