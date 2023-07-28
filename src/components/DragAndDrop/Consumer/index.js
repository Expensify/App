import React, {useContext, useEffect} from 'react';
import {Portal} from '@gorhom/portal';
import dragAndDropConsumerPropTypes from './dragAndDropConsumerPropTypes';
import {DragAndDropContext} from '../Provider';

function DragAndDropConsumer({children, onDrop}) {
    const {isDraggingOver, setOnDropListener, dropZoneID} = useContext(DragAndDropContext);

    useEffect(() => {
        setOnDropListener(onDrop);
    }, [onDrop, setOnDropListener]);

    if (!isDraggingOver) {
        return null;
    }

    return <Portal hostName={dropZoneID}>{children}</Portal>;
}

DragAndDropConsumer.propTypes = dragAndDropConsumerPropTypes;
DragAndDropConsumer.displayName = 'DragAndDropConsumer';

export default DragAndDropConsumer;
