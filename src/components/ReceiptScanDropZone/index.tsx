import React from 'react';
import type {StyleProp, View, ViewStyle} from 'react-native';
import {View as RNView} from 'react-native';
import DropZoneUI from '@components/DropZone/DropZoneUI';
import useDragAndDrop from '@hooks/useDragAndDrop';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useReceiptScanDrop from '@hooks/useReceiptScanDrop';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import htmlDivElementRef from '@src/types/utils/htmlDivElementRef';

type ReceiptScanDropZoneProps = {
    targetRef: React.RefObject<View | HTMLDivElement | null>;
    dropWrapperStyle?: StyleProp<ViewStyle>;
};

function shouldAcceptDrop(event: DragEvent): boolean {
    return !!event.dataTransfer?.types.some((type) => type === 'Files');
}

function ReceiptScanDropZone({targetRef, dropWrapperStyle}: ReceiptScanDropZoneProps) {
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

export default ReceiptScanDropZone;
