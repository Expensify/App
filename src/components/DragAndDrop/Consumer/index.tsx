import {Portal} from '@gorhom/portal';
import React, {useContext, useEffect} from 'react';
import {DragAndDropContext} from '@components/DragAndDrop/Provider';
import type DragAndDropConsumerProps from './types';

function DragAndDropConsumer({children, onDrop}: DragAndDropConsumerProps) {
    const {isDraggingOver, setOnDropHandler, dropZoneID} = useContext(DragAndDropContext);

    useEffect(() => {
        setOnDropHandler?.(onDrop);
    }, [onDrop, setOnDropHandler]);

    if (!isDraggingOver) {
        return null;
    }

    return <Portal hostName={dropZoneID}>{children}</Portal>;
}

DragAndDropConsumer.displayName = 'DragAndDropConsumer';

export default DragAndDropConsumer;
