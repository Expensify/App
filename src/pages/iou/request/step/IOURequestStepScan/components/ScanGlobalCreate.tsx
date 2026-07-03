import {useFullScreenLoaderActions} from '@components/FullScreenLoaderContext';
import withCurrentUserPersonalDetails from '@components/withCurrentUserPersonalDetails';
import type {WithCurrentUserPersonalDetailsProps} from '@components/withCurrentUserPersonalDetails';

import useFilesValidation from '@hooks/useFilesValidation';
import {precacheReceiptImage} from '@hooks/useLocalReceiptThumbnail';
import useOnyx from '@hooks/useOnyx';
import useOptimisticDraftTransactions from '@hooks/useOptimisticDraftTransactions';

import type {ReceiptFile} from '@pages/iou/request/step/IOURequestStepScan/types';
import buildReceiptFiles from '@pages/iou/request/step/IOURequestStepScan/utils/buildReceiptFiles';
import getFileSource from '@pages/iou/request/step/IOURequestStepScan/utils/getFileSource';
import useScanFileReadabilityCheck from '@pages/iou/request/step/IOURequestStepScan/utils/useScanFileReadabilityCheck';

import type {IOUType} from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import {validTransactionDraftIDsSelector} from '@src/selectors/TransactionDraft';
import type Transaction from '@src/types/onyx/Transaction';
import type {FileObject} from '@src/types/utils/Attachment';

import type {OnyxEntry} from 'react-native-onyx';

import React from 'react';

import Camera from './Camera';
import {useMultiScanActions, useMultiScanState} from './MultiScanContext';
import {NavigateGlobalCreateProvider, useNavigateGlobalCreate} from './NavigateGlobalCreateContext';

type ScanGlobalCreateProps = WithCurrentUserPersonalDetailsProps & {
    iouType: IOUType;
    reportID: string;
    transactionID: string;
    transaction: OnyxEntry<Transaction>;
    backToReport: string | undefined;
};

/**
 * ScanGlobalCreate — initiated from the FAB (+) button (no specific report).
 * Uses default expense policy to auto-select workspace, or navigates to participant picker.
 *
 * Wrapper renders NavigateGlobalCreateProvider so post-capture Onyx reads stay
 * off the camera-mount critical path. See NavigateGlobalCreateContext.tsx.
 */
function ScanGlobalCreate({iouType, backToReport, ...innerProps}: ScanGlobalCreateProps) {
    return (
        <NavigateGlobalCreateProvider
            iouType={iouType}
            backToReport={backToReport}
            {...innerProps}
        >
            <ScanGlobalCreateInner {...innerProps} />
        </NavigateGlobalCreateProvider>
    );
}

type ScanGlobalCreateInnerProps = Omit<ScanGlobalCreateProps, 'iouType' | 'backToReport'>;

function ScanGlobalCreateInner({reportID, transactionID, transaction, currentUserPersonalDetails}: ScanGlobalCreateInnerProps) {
    const navigateGlobalCreate = useNavigateGlobalCreate();
    const [draftTransactionIDs] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION_DRAFT, {
        selector: validTransactionDraftIDsSelector,
    });
    const {isMultiScanEnabled} = useMultiScanState();
    const {disableMultiScan} = useMultiScanActions();
    const {setIsLoaderVisible} = useFullScreenLoaderActions();
    const [transactions] = useOptimisticDraftTransactions(transaction);

    useScanFileReadabilityCheck(transactions, draftTransactionIDs ?? [], disableMultiScan);

    const processReceipts = (files: FileObject[]) => {
        const receiptFiles = buildReceiptFiles({
            files,
            getFileSource,
            initialTransaction: transaction,
            initialTransactionID: transactionID,
            currentUserPersonalDetails,
            reportID,
            shouldAcceptMultipleFiles: true,
            isMultiScanEnabled,
            transactions,
            draftTransactionIDsToCleanUp: draftTransactionIDs,
        });

        if (receiptFiles.length === 0) {
            return;
        }

        if (isMultiScanEnabled) {
            return;
        }

        navigateGlobalCreate(
            receiptFiles.map((rf: ReceiptFile) => rf.transactionID),
            isMultiScanEnabled,
        );
    };

    const submitMultiScan = () => {
        const ids = transactions.map((t) => t.transactionID).filter((id): id is string => !!id);
        if (ids.length === 0) {
            return;
        }
        navigateGlobalCreate(ids, isMultiScanEnabled);
    };

    const {validateFiles, PDFValidationComponent, ErrorModal} = useFilesValidation((files: FileObject[]) => {
        processReceipts(files);
    });

    return (
        <>
            {PDFValidationComponent}
            <Camera
                onCapture={(file, source) => {
                    if (isMultiScanEnabled) {
                        processReceipts([file]);
                        return;
                    }
                    // Pre-warm the thumbnail cache before navigating so the confirm page
                    // doesn't flash an un-thumbnail receipt.
                    precacheReceiptImage(source).then(() => processReceipts([file]));
                }}
                onPicked={validateFiles}
                onAttachmentPickerStatusChange={setIsLoaderVisible}
                onMultiScanSubmit={submitMultiScan}
                shouldAcceptMultipleFiles
            />
            {ErrorModal}
        </>
    );
}

ScanGlobalCreate.displayName = 'ScanGlobalCreate';

export default withCurrentUserPersonalDetails(ScanGlobalCreate);
