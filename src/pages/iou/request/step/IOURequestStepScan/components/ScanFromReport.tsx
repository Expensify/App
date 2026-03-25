import React, {useEffect, useState} from 'react';
import {View} from 'react-native';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useFilesValidation from '@hooks/useFilesValidation';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useOptimisticDraftTransactions from '@hooks/useOptimisticDraftTransactions';
import useThemeStyles from '@hooks/useThemeStyles';
import {navigateToConfirmationPage} from '@libs/IOUUtils';
import Navigation from '@libs/Navigation/Navigation';
import {endSpan} from '@libs/telemetry/activeSpans';
import type {ReceiptFile, ScanRoute} from '@pages/iou/request/step/IOURequestStepScan/types';
import buildReceiptFiles from '@pages/iou/request/step/IOURequestStepScan/utils/buildReceiptFiles';
import getFileSource from '@pages/iou/request/step/IOURequestStepScan/utils/getFileSource';
import startScanProcessSpan from '@pages/iou/request/step/IOURequestStepScan/utils/startScanProcessSpan';
import useScanFileReadabilityCheck from '@pages/iou/request/step/IOURequestStepScan/utils/useScanFileReadabilityCheck';
import StepScreenWrapper from '@pages/iou/request/step/StepScreenWrapper';
import {setMoneyRequestReceipt, setMultipleMoneyRequestParticipantsFromReport} from '@userActions/IOU';
import {buildOptimisticTransactionAndCreateDraft} from '@userActions/TransactionEdit';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {FileObject} from '@src/types/utils/Attachment';
import Camera from './Camera';
import {useMultiScanState} from './MultiScanContext';
import MultiScanEducationalModal from './MultiScanEducationalModal';
import ReceiptPreviews from './ReceiptPreviews';

/**
 * ScanFromReport — the most common scan flow.
 * Used when scanning from within a report (!isFromGlobalCreate && !shouldSkipConfirmation).
 *
 * Press handler: setMultipleMoneyRequestParticipantsFromReport -> navigateToConfirmationPage
 */
type ScanFromReportProps = {
    route: ScanRoute;
};

function ScanFromReport({route}: ScanFromReportProps) {
    const {action, iouType, reportID, transactionID: initialTransactionID, backTo, backToReport} = route.params;

    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`);
    const [initialTransaction] = useOnyx(`${ONYXKEYS.COLLECTION.TRANSACTION}${initialTransactionID}`);
    const [transactions] = useOptimisticDraftTransactions(initialTransaction);
    const {isMultiScanEnabled, canUseMultiScan} = useMultiScanState();

    const isEditing = action === CONST.IOU.ACTION.EDIT;
    const shouldAcceptMultipleFiles = !isEditing && !backTo;
    const shouldShowWrapper = !!backTo || isEditing;

    const [receiptFiles, setReceiptFiles] = useState<ReceiptFile[]>([]);

    const navigateBack = () => {
        Navigation.goBack(backTo);
    };

    function submitMultiScanReceipts(files: ReceiptFile[]) {
        startScanProcessSpan();
        const transactionIDs = files.map((receiptFile) => receiptFile.transactionID);
        setMultipleMoneyRequestParticipantsFromReport(transactionIDs, report, currentUserPersonalDetails.accountID).then(() =>
            navigateToConfirmationPage(iouType, initialTransactionID, reportID, backToReport),
        );
    }

    function onFilesAccepted(files: FileObject[]) {
        if (files.length === 0) {
            return;
        }

        // Multi-scan: create draft per capture, accumulate, don't navigate
        if (isMultiScanEnabled) {
            for (const file of files) {
                const source = getFileSource(file);
                const transaction = initialTransaction?.receipt?.source
                    ? buildOptimisticTransactionAndCreateDraft({initialTransaction, currentUserPersonalDetails, reportID})
                    : initialTransaction;
                const transactionID = transaction?.transactionID ?? initialTransactionID;
                setMoneyRequestReceipt(transactionID, source, file.name ?? '', true, file.type);
                setReceiptFiles((prev) => [...prev, {file, source, transactionID}]);
            }
            return;
        }

        const newReceiptFiles = buildReceiptFiles({
            files,
            getSource: getFileSource,
            initialTransaction,
            initialTransactionID,
            shouldAcceptMultipleFiles,
            transactions,
            currentUserPersonalDetails,
            reportID,
        });

        startScanProcessSpan();

        if (backTo) {
            Navigation.goBack(backTo);
            return;
        }

        // The main flow for ScanFromReport: set participants from the report and navigate to confirmation
        const transactionIDs = newReceiptFiles.map((receiptFile) => receiptFile.transactionID);
        setMultipleMoneyRequestParticipantsFromReport(transactionIDs, report, currentUserPersonalDetails.accountID).then(() =>
            navigateToConfirmationPage(iouType, initialTransactionID, reportID, backToReport),
        );
    }

    const {validateFiles, PDFValidationComponent, ErrorModal} = useFilesValidation((files: FileObject[]) => {
        onFilesAccepted(files);
    });

    function onCapture(file: FileObject, source: string) {
        const fileWithUri = file;
        fileWithUri.uri = source;
        onFilesAccepted([fileWithUri]);
    }

    // End the create expense span on mount
    useEffect(() => {
        endSpan(CONST.TELEMETRY.SPAN_OPEN_CREATE_EXPENSE);
    }, []);

    useScanFileReadabilityCheck(transactions);

    return (
        <StepScreenWrapper
            headerTitle={translate('common.receipt')}
            onBackButtonPress={navigateBack}
            shouldShowWrapper={shouldShowWrapper}
            testID="IOURequestStepScan"
        >
            <View style={styles.flex1}>
                {PDFValidationComponent}
                <Camera
                    // eslint-disable-next-line react/jsx-no-bind -- React Compiler handles memoization
                    onCapture={onCapture}
                    onDrop={validateFiles}
                    shouldAcceptMultipleFiles={shouldAcceptMultipleFiles}
                />
                {!!canUseMultiScan && (
                    <ReceiptPreviews
                        isMultiScanEnabled={!!isMultiScanEnabled}
                        submit={() => submitMultiScanReceipts(receiptFiles)}
                    />
                )}
                <MultiScanEducationalModal />
                {ErrorModal}
            </View>
        </StepScreenWrapper>
    );
}

ScanFromReport.displayName = 'ScanFromReport';

export default ScanFromReport;
