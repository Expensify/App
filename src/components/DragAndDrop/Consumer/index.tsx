import {Portal} from '@gorhom/portal';
import React, {useEffect} from 'react';
import {useDragAndDropActions, useDragAndDropState} from '@components/DragAndDrop/Provider';
import type DragAndDropConsumerProps from './types';

function DragAndDropConsumer({children, onDrop}: DragAndDropConsumerProps) {
    const {isDraggingOver, dropZoneID} = useDragAndDropState();
    const {setOnDropHandler} = useDragAndDropActions();

    useEffect(() => {
        if (!onDrop) {
            return;
        }
        setOnDropHandler(onDrop);
    }, [onDrop, setOnDropHandler]);

    if (!isDraggingOver) {
        return null;
    }

    return <Portal hostName={dropZoneID}>{children}</Portal>;
}

export default DragAndDropConsumer;
