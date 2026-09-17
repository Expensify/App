import {DragAndDropStateContext} from '@components/DragAndDrop/Provider/DragAndDropContext';

import type {ReactNode, RefObject} from 'react';
import type {StyleProp, View, ViewStyle} from 'react-native';

import React, {useState} from 'react';

import ReceiptScanDropTarget from './ReceiptScanDropTarget';

type ReceiptScanDropZoneProps = {
    /** The page content that receipts can be dropped onto */
    children: ReactNode;

    /** Ref to the container receipts are dropped onto */
    dropZoneRef: RefObject<View | HTMLDivElement | null>;

    /** Whether the drop zone is disabled, keeping the scan logic unmounted */
    isDisabled?: boolean;

    dropWrapperStyle?: StyleProp<ViewStyle>;
};

/**
 * Turns the page into a receipt scan drop zone and publishes the drag state to it, so components inside can react to a
 * file being dragged over the page.
 */
function ReceiptScanDropZone({children, dropZoneRef, isDisabled = false, dropWrapperStyle}: ReceiptScanDropZoneProps) {
    const [isDraggingOver, setIsDraggingOver] = useState(false);

    return (
        // eslint-disable-next-line react/jsx-no-constructed-context-values
        <DragAndDropStateContext.Provider value={{isDraggingOver, dropZoneID: ''}}>
            {children}
            {!isDisabled && (
                <ReceiptScanDropTarget
                    targetRef={dropZoneRef}
                    dropWrapperStyle={dropWrapperStyle}
                    onDraggingOverChange={setIsDraggingOver}
                />
            )}
        </DragAndDropStateContext.Provider>
    );
}

export default ReceiptScanDropZone;
