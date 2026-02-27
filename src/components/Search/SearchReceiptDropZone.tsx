import React from 'react';
import type {StyleProp, ViewStyle} from 'react-native';
import DragAndDropConsumer from '@components/DragAndDrop/Consumer';
import DragAndDropProvider from '@components/DragAndDrop/Provider';
import DropZoneUI from '@components/DropZone/DropZoneUI';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useReceiptScanDrop from '@hooks/useReceiptScanDrop';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import type ChildrenProps from '@src/types/utils/ChildrenProps';

type SearchReceiptDropZoneProps = ChildrenProps & {
    /** Extra styles applied to the drop zone overlay wrapper (e.g. bottom padding for the nav tab bar on narrow layouts) */
    dropWrapperStyles?: StyleProp<ViewStyle>;
    /**
     * When true the ErrorModal is rendered inside the DragAndDropProvider (narrow layout).
     * When false (default) the ErrorModal is rendered as the last sibling of the returned fragment,
     * outside any scroll/screen containers (wide layout).
     */
    renderErrorModalInside?: boolean;
};

/**
 * Wraps page content in a DragAndDrop zone for receipt scanning.
 * Owns all drag-and-drop hook calls so the parent page stays hook-free for this feature.
 */
function SearchReceiptDropZone({children, dropWrapperStyles, renderErrorModalInside = false}: SearchReceiptDropZoneProps) {
    const {initScanRequest, PDFValidationComponent, ErrorModal, isDragDisabled} = useReceiptScanDrop();
    const expensifyIcons = useMemoizedLazyExpensifyIcons(['SmartScan'] as const);
    const {translate} = useLocalize();
    const theme = useTheme();
    const styles = useThemeStyles();

    const dropZoneConsumer = (
        <DragAndDropConsumer onDrop={initScanRequest}>
            <DropZoneUI
                icon={expensifyIcons.SmartScan}
                dropTitle={translate('dropzone.scanReceipts')}
                dropStyles={styles.receiptDropOverlay(true)}
                dropTextStyles={styles.receiptDropText}
                dropWrapperStyles={dropWrapperStyles}
                dashedBorderStyles={[styles.dropzoneArea, styles.easeInOpacityTransition, styles.activeDropzoneDashedBorder(theme.receiptDropBorderColorActive, true)]}
            />
        </DragAndDropConsumer>
    );

    return (
        <>
            <DragAndDropProvider isDisabled={isDragDisabled}>
                {PDFValidationComponent}
                {children}
                {dropZoneConsumer}
                {renderErrorModalInside && ErrorModal}
            </DragAndDropProvider>
            {!renderErrorModalInside && ErrorModal}
        </>
    );
}

export default SearchReceiptDropZone;
