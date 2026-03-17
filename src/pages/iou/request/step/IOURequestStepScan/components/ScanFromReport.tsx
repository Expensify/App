import {useRoute} from '@react-navigation/native';
import React, {useEffect} from 'react';
import TestReceipt from '@assets/images/fake-receipt.png';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useFilesValidation from '@hooks/useFilesValidation';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useOptimisticDraftTransactions from '@hooks/useOptimisticDraftTransactions';
import setTestReceipt from '@libs/actions/setTestReceipt';
import {isLocalFile as isLocalFileFileUtils} from '@libs/fileDownload/FileUtils';
import {navigateToConfirmationPage} from '@libs/IOUUtils';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackRouteProp} from '@libs/Navigation/PlatformStackNavigation/types';
import type {MoneyRequestNavigatorParamList} from '@libs/Navigation/types';
import {endSpan, getSpan, startSpan} from '@libs/telemetry/activeSpans';
import {shouldReuseInitialTransaction} from '@libs/TransactionUtils';
import type {ReceiptFile} from '@pages/iou/request/step/IOURequestStepScan/types';
import StepScreenWrapper from '@pages/iou/request/step/StepScreenWrapper';
import {checkIfScanFileCanBeRead, setMoneyRequestReceipt, setMultipleMoneyRequestParticipantsFromReport} from '@userActions/IOU';
import {buildOptimisticTransactionAndCreateDraft, removeDraftTransactions, removeTransactionReceipt} from '@userActions/TransactionEdit';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';
import type Transaction from '@src/types/onyx/Transaction';
import type {FileObject} from '@src/types/utils/Attachment';
import Camera from './Camera';

/**
 * ScanFromReport — the most common scan flow.
 * Used when scanning from within a report (!isFromGlobalCreate && !shouldSkipConfirmation).
 *
 * Press handler: setMultipleMoneyRequestParticipantsFromReport -> navigateToConfirmationPage
 */
function ScanFromReport() {
    const route = useRoute<PlatformStackRouteProp<MoneyRequestNavigatorParamList, typeof SCREENS.MONEY_REQUEST.STEP_SCAN>>();
    const {action, iouType, reportID, transactionID: initialTransactionID, backTo, backToReport} = route.params;

    const {translate} = useLocalize();
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`);
    const [initialTransaction] = useOnyx(`${ONYXKEYS.COLLECTION.TRANSACTION}${initialTransactionID}`);
    const [transactions] = useOptimisticDraftTransactions(initialTransaction);

    const isEditing = action === CONST.IOU.ACTION.EDIT;
    const shouldAcceptMultipleFiles = !isEditing && !backTo;
    const shouldShowWrapper = !!backTo || isEditing;

    const navigateBack = () => {
        Navigation.goBack(backTo);
    };

    // The extra params satisfy the prop contract but are not used by this variant
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    function navigateToConfirmationStep(files: ReceiptFile[], _locationPermissionGranted = false, _isTestTransaction = false) {
        startSpan(CONST.TELEMETRY.SPAN_SCAN_PROCESS_AND_NAVIGATE, {
            name: CONST.TELEMETRY.SPAN_SCAN_PROCESS_AND_NAVIGATE,
            op: CONST.TELEMETRY.SPAN_SCAN_PROCESS_AND_NAVIGATE,
            parentSpan: getSpan(CONST.TELEMETRY.SPAN_SHUTTER_TO_CONFIRMATION),
            attributes: {[CONST.TELEMETRY.ATTRIBUTE_IS_MULTI_SCAN]: false},
        });

        if (backTo) {
            Navigation.goBack(backTo);
            return;
        }

        // The main flow for ScanFromReport: set participants from the report and navigate to confirmation
        const transactionIDs = files.map((receiptFile) => receiptFile.transactionID);
        setMultipleMoneyRequestParticipantsFromReport(transactionIDs, report, currentUserPersonalDetails.accountID).then(() =>
            navigateToConfirmationPage(iouType, initialTransactionID, reportID, backToReport),
        );
    }

    function processReceipts(files: FileObject[], getFileSource: (file: FileObject) => string) {
        if (files.length === 0) {
            return;
        }

        const newReceiptFiles: ReceiptFile[] = [];

        for (const [index, file] of files.entries()) {
            const source = getFileSource(file);
            const transaction = shouldReuseInitialTransaction(initialTransaction, shouldAcceptMultipleFiles, index, false, transactions)
                ? (initialTransaction as Partial<Transaction>)
                : buildOptimisticTransactionAndCreateDraft({
                      initialTransaction: initialTransaction as Partial<Transaction>,
                      currentUserPersonalDetails,
                      reportID,
                  });

            const transactionID = transaction.transactionID ?? initialTransactionID;
            newReceiptFiles.push({file, source, transactionID});
            setMoneyRequestReceipt(transactionID, source, file.name ?? '', true, file.type);
        }

        // ScanFromReport never skips confirmation, so go straight to navigateToConfirmationStep
        navigateToConfirmationStep(newReceiptFiles, false);
    }

    const getSource = (file: FileObject) => file.uri ?? URL.createObjectURL(file as Blob);

    const {validateFiles, PDFValidationComponent, ErrorModal} = useFilesValidation((files: FileObject[]) => {
        processReceipts(files, getSource);
    });

    function handleCapture(file: FileObject, source: string) {
        // Attach the source URI so getSource can find it
        const fileWithUri: FileObject = file;
        fileWithUri.uri = source;
        validateFiles([fileWithUri]);
    }

    // Exposed for test infrastructure via onLayout pattern — will be wired by the router component
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    function setTestReceiptAndNavigate() {
        setTestReceipt(TestReceipt, 'png', (source, file, filename) => {
            setMoneyRequestReceipt(initialTransactionID, source, filename, !isEditing, CONST.TEST_RECEIPT.FILE_TYPE, true);
            removeDraftTransactions(true);
            navigateToConfirmationStep([{file, source, transactionID: initialTransactionID}], false, true);
        });
    }

    // End the create expense span on mount
    useEffect(() => {
        endSpan(CONST.TELEMETRY.SPAN_OPEN_CREATE_EXPENSE);
    }, []);

    // Check if scan file can be read on mount
    useEffect(() => {
        let isAllScanFilesCanBeRead = true;

        Promise.all(
            transactions.map((item) => {
                const itemReceiptPath = item.receipt?.source;
                const isLocalFile = isLocalFileFileUtils(itemReceiptPath);

                if (!isLocalFile) {
                    return Promise.resolve();
                }

                const onFailure = () => {
                    isAllScanFilesCanBeRead = false;
                };

                return checkIfScanFileCanBeRead(item.receipt?.filename, itemReceiptPath, item.receipt?.type, () => {}, onFailure);
            }),
        ).then(() => {
            if (isAllScanFilesCanBeRead) {
                return;
            }
            removeTransactionReceipt(CONST.IOU.OPTIMISTIC_TRANSACTION_ID);
            removeDraftTransactions(true);
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <StepScreenWrapper
            headerTitle={translate('common.receipt')}
            onBackButtonPress={navigateBack}
            shouldShowWrapper={shouldShowWrapper}
            testID="IOURequestStepScan"
        >
            {PDFValidationComponent}
            <Camera
                // eslint-disable-next-line react/jsx-no-bind -- React Compiler handles memoization
                onCapture={handleCapture}
                shouldAcceptMultipleFiles={shouldAcceptMultipleFiles}
            />
            {ErrorModal}
        </StepScreenWrapper>
    );
}

ScanFromReport.displayName = 'ScanFromReport';

export default ScanFromReport;
