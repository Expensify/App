import React, {useContext, useEffect, useRef} from 'react';
import {Portal} from '@gorhom/portal';
import dragAndDropConsumerPropTypes from './dragAndDropConsumerPropTypes';
import DragAndDropUtils from '../Utils';

function DragAndDropConsumer({children, dropZoneID, onDrop}) {
    const DragAndDropContext = DragAndDropUtils.getDragAndDropContext(dropZoneID);
    const {isDraggingOver} = useContext(DragAndDropContext);

    useEffect(() => {
        DragAndDropUtils.registerOnDropCallback(dropZoneID, onDrop);
        return () => DragAndDropUtils.deregisterOnDropCallback(dropZoneID, onDrop);
    }, [dropZoneID, onDrop]);

    if (!isDraggingOver) {
        return null;
    }

    return <Portal hostName={dropZoneID}>{children}</Portal>;
}

DragAndDropConsumer.propTypes = dragAndDropConsumerPropTypes;
DragAndDropConsumer.displayName = 'DragAndDropConsumer';

export default DragAndDropConsumer;
