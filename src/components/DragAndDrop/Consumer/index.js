import React, {useContext, useEffect, useRef} from 'react';
import {Portal} from '@gorhom/portal';
import dragAndDropConsumerPropTypes from './dragAndDropConsumerPropTypes';
import DragAndDropUtils from '../Utils';

function DragAndDropConsumer({children, dropZoneID, onDrop}) {
    const DragAndDropContext = DragAndDropUtils.getDragAndDropContext(dropZoneID);
    const {isDraggingOver} = useContext(DragAndDropContext);

    const onDropRef = useRef(onDrop);
    onDropRef.current = onDrop;
    useEffect(() => {
        // Internal function ensures that we only register the onDrop listener once for this consumer,
        // even if the onDrop function passed in changes
        const onDropCallback = (e) => {
            if (!onDropRef.current) {
                return;
            }
            onDropRef.current(e);
        };
        DragAndDropUtils.registerOnDropCallback(dropZoneID, onDropCallback);
        return () => DragAndDropUtils.deregisterOnDropCallback(dropZoneID, onDropCallback);
    }, [dropZoneID]);

    if (!isDraggingOver) {
        return null;
    }

    return <Portal hostName={dropZoneID}>{children}</Portal>;
}

DragAndDropConsumer.propTypes = dragAndDropConsumerPropTypes;
DragAndDropConsumer.displayName = 'DragAndDropConsumer';

export default DragAndDropConsumer;
