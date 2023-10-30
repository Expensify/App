import React, {useContext, useEffect} from 'react';
import {Portal} from '@gorhom/portal';
import dragAndDropConsumerPropTypes from './dragAndDropConsumerPropTypes';
import {DragAndDropContext} from '../Provider';

function DragAndDropConsumer({children, onDrop}) {
    const {isDraggingOver, setOnDropHandler, dropZoneID} = useContext(DragAndDropContext);

    useEffect(() => {
        setOnDropHandler(onDrop);
    }, [onDrop, setOnDropHandler]);

    if (!isDraggingOver) {
        return null;
    }

    return <Portal hostName={dropZoneID}>{children}</Portal>;
}

DragAndDropConsumer.propTypes = dragAndDropConsumerPropTypes;
DragAndDropConsumer.displayName = 'DragAndDropConsumer';

export default DragAndDropConsumer;
