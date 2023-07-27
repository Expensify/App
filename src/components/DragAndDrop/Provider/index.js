import _ from 'underscore';
import React, {useCallback, useEffect, useRef, useState} from 'react';
import {View} from 'react-native';
import {useIsFocused} from '@react-navigation/native';
import {PortalHost} from '@gorhom/portal';
import dragAndDropProviderPropTypes from './dragAndDropProviderPropTypes';
import DNDUtils from '../Utils';
import styles from '../../../styles/styles';

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

function DragAndDropProvider({children, dropZoneID, isDisabled = false}) {
    const DragAndDropContext = DNDUtils.getDragAndDropContext(dropZoneID, true);
    useEffect(
        () => () => {
            DNDUtils.deleteDragAndDropContext(dropZoneID);
        },
        [dropZoneID],
    );

    const isFocused = useIsFocused();

    const dropZone = useRef(null);
    const dragCounter = useRef(0);

    const [isDraggingOver, setIsDraggingOver] = useState(false);

    // If this component is out of focus or disabled, reset the drag state back to the default
    useEffect(() => {
        if (isFocused && !isDisabled) {
            return;
        }
        dragCounter.current = 0;
        setIsDraggingOver(false);
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

            if (shouldAcceptDrop(event)) {
                switch (event.type) {
                    case DRAG_OVER_EVENT:
                        // Nothing needed here, just needed to preventDefault in order for the drop event to fire later
                        break;
                    case DRAG_ENTER_EVENT:
                        dragCounter.current++;
                        if (isDraggingOver) {
                            return;
                        }
                        // eslint-disable-next-line no-param-reassign
                        event.dataTransfer.dropEffect = COPY_DROP_EFFECT;
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
                        DNDUtils.executeOnDropCallbacks(event, dropZoneID);
                        break;
                    default:
                        break;
                }
            } else {
                // eslint-disable-next-line no-param-reassign
                event.dataTransfer.dropEffect = NONE_DROP_EFFECT;
            }
        },
        [isFocused, isDisabled, isDraggingOver, dropZoneID],
    );

    useEffect(() => {
        if (!dropZone.current) {
            return;
        }

        // Note that the dragover event needs to be called with `event.preventDefault` in order for the drop event to be fired:
        // https://stackoverflow.com/questions/21339924/drop-event-not-firing-in-chrome
        dropZone.current.addEventListener(DRAG_OVER_EVENT, dropZoneDragHandler);
        dropZone.current.addEventListener(DRAG_ENTER_EVENT, dropZoneDragHandler);
        dropZone.current.addEventListener(DRAG_LEAVE_EVENT, dropZoneDragHandler);
        dropZone.current.addEventListener(DROP_EVENT, dropZoneDragHandler);
        return () => {
            if (!dropZone.current) {
                return;
            }

            dropZone.current.removeEventListener(DRAG_OVER_EVENT, dropZoneDragHandler);
            dropZone.current.removeEventListener(DRAG_ENTER_EVENT, dropZoneDragHandler);
            dropZone.current.removeEventListener(DRAG_LEAVE_EVENT, dropZoneDragHandler);
            dropZone.current.removeEventListener(DROP_EVENT, dropZoneDragHandler);
        };
    }, [dropZoneDragHandler]);

    return (
        <DragAndDropContext.Provider value={{isDraggingOver}}>
            <View
                ref={(e) => (dropZone.current = e)}
                style={[styles.flex1, styles.w100, styles.h100]}
            >
                <View
                    style={[styles.fullScreen, styles.invisibleOverlay]}
                    nativeID={dropZoneID}
                >
                    <PortalHost name={dropZoneID} />
                </View>
                {children}
            </View>
        </DragAndDropContext.Provider>
    );
}

DragAndDropProvider.propTypes = dragAndDropProviderPropTypes;
DragAndDropProvider.displayName = 'DragAndDropProvider';

export default DragAndDropProvider;
