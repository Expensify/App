import React from 'react';
import DragAndDropConsumer from '@components/DragAndDrop/Consumer';
import DragAndDropProvider from '@components/DragAndDrop/Provider';
import DropZoneUI from '@components/DropZone/DropZoneUI';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useReceiptScanDrop from '@hooks/useReceiptScanDrop';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import variables from '@styles/variables';

type SearchReceiptDropBoundaryProps = {
    children: React.ReactNode;
    shouldUseNarrowLayout: boolean;
};

function SearchReceiptDropBoundary({children, shouldUseNarrowLayout}: SearchReceiptDropBoundaryProps) {
    const styles = useThemeStyles();
    const theme = useTheme();
    const {translate} = useLocalize();
    const expensifyIcons = useMemoizedLazyExpensifyIcons(['SmartScan'] as const);
    const {initScanRequest, PDFValidationComponent, ErrorModal, isDragDisabled} = useReceiptScanDrop();

    return (
        <>
            <DragAndDropProvider isDisabled={isDragDisabled}>
                {PDFValidationComponent}
                {children}
                <DragAndDropConsumer onDrop={initScanRequest}>
                    <DropZoneUI
                        icon={expensifyIcons.SmartScan}
                        dropTitle={translate('dropzone.scanReceipts')}
                        dropStyles={styles.receiptDropOverlay(true)}
                        dropTextStyles={styles.receiptDropText}
                        dropWrapperStyles={shouldUseNarrowLayout ? {marginBottom: variables.bottomTabHeight} : undefined}
                        dashedBorderStyles={[styles.dropzoneArea, styles.easeInOpacityTransition, styles.activeDropzoneDashedBorder(theme.receiptDropBorderColorActive, true)]}
                    />
                </DragAndDropConsumer>
            </DragAndDropProvider>
            {ErrorModal}
        </>
    );
}

export default SearchReceiptDropBoundary;
