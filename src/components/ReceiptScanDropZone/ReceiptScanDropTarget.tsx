import DropZoneUI from '@components/DropZone/DropZoneUI';

import useDragAndDrop from '@hooks/useDragAndDrop';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useReceiptScanDrop from '@hooks/useReceiptScanDrop';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import {shouldAcceptDrop} from '@libs/DragAndDropUtils';

import htmlDivElementRef from '@src/types/utils/htmlDivElementRef';

import type {StyleProp, View, ViewStyle} from 'react-native';

import React, {useEffect} from 'react';
import {View as RNView} from 'react-native';

type ReceiptScanDropTargetProps = {
    /** Ref to the element the drag events are bound to */
    targetRef: React.RefObject<View | HTMLDivElement | null>;

    dropWrapperStyle?: StyleProp<ViewStyle>;

    /** Reports the drag-over state back to the drop zone, which publishes it through DragAndDropStateContext */
    onDraggingOverChange: (isDraggingOver: boolean) => void;
};

/**
 * Owns the receipt scan drag-and-drop logic and the drop overlay.
 */
function ReceiptScanDropTarget({targetRef, dropWrapperStyle, onDraggingOverChange}: ReceiptScanDropTargetProps) {
    const styles = useThemeStyles();
    const theme = useTheme();
    const {translate} = useLocalize();
    const expensifyIcons = useMemoizedLazyExpensifyIcons(['SmartScan']);
    const {initScanRequest, auxiliaryUI, isDragDisabled} = useReceiptScanDrop();

    const {isDraggingOver} = useDragAndDrop({
        dropZone: htmlDivElementRef(targetRef),
        onDrop: initScanRequest,
        shouldAcceptDrop,
        isDisabled: isDragDisabled,
    });

    useEffect(() => {
        onDraggingOverChange(isDraggingOver);
        return () => onDraggingOverChange(false);
    }, [isDraggingOver, onDraggingOverChange]);

    return (
        <>
            {isDraggingOver && (
                <RNView
                    pointerEvents="none"
                    style={[styles.fullScreen, styles.pAbsolute, styles.invisibleOverlay]}
                >
                    <DropZoneUI
                        icon={expensifyIcons.SmartScan}
                        dropTitle={translate('dropzone.scanReceipts')}
                        dropStyles={styles.receiptDropOverlay(true)}
                        dropTextStyles={styles.receiptDropText}
                        dropWrapperStyles={dropWrapperStyle}
                        dashedBorderStyles={[styles.dropzoneArea, styles.easeInOpacityTransition, styles.activeDropzoneDashedBorder(theme.receiptDropBorderColorActive, true)]}
                    />
                </RNView>
            )}
            {auxiliaryUI}
        </>
    );
}

export default ReceiptScanDropTarget;
