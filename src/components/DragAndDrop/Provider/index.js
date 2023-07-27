import _ from 'underscore';
import React, {useEffect, useRef} from 'react';
import {View} from 'react-native';
import {PortalHost} from '@gorhom/portal';
import dragAndDropProviderPropTypes from './dragAndDropProviderPropTypes';
import DragAndDropUtils from '../Utils';
import styles from '../../../styles/styles';
import useDragAndDrop from '../../../hooks/useDragAndDrop';

/**
 * @param {Event} event – drag event
 * @returns {Boolean}
 */
function shouldAcceptDrop(event) {
    return _.some(event.dataTransfer.types, (type) => type === 'Files');
}

function DragAndDropProvider({children, dropZoneID, isDisabled = false}) {
    const DragAndDropContext = DragAndDropUtils.getDragAndDropContext(dropZoneID, true);
    useEffect(
        () => () => {
            DragAndDropUtils.deleteDragAndDropContext(dropZoneID);
        },
        [dropZoneID],
    );

    const dropZone = useRef(null);
    const {isDraggingOver} = useDragAndDrop({
        dropZone,
        onDrop: (event) => {
            DragAndDropUtils.executeOnDropCallbacks(event, dropZoneID);
        },
        shouldAcceptDrop,
        isDisabled,
    });

    return (
        <DragAndDropContext.Provider value={{isDraggingOver}}>
            <View
                ref={(e) => (dropZone.current = e)}
                style={[styles.flex1, styles.w100, styles.h100]}
            >
                {isDraggingOver && (
                    <View
                        style={[styles.fullScreen, styles.invisibleOverlay]}
                        nativeID={dropZoneID}
                    >
                        <PortalHost name={dropZoneID} />
                    </View>
                )}
                {children}
            </View>
        </DragAndDropContext.Provider>
    );
}

DragAndDropProvider.propTypes = dragAndDropProviderPropTypes;
DragAndDropProvider.displayName = 'DragAndDropProvider';

export default DragAndDropProvider;
