import {useRoute} from '@react-navigation/native';
import React, {useEffect} from 'react';
import {View} from 'react-native';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useFilesValidation from '@hooks/useFilesValidation';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useOptimisticDraftTransactions from '@hooks/useOptimisticDraftTransactions';
import {navigateToConfirmationPage} from '@libs/IOUUtils';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackRouteProp} from '@libs/Navigation/PlatformStackNavigation/types';
import type {MoneyRequestNavigatorParamList} from '@libs/Navigation/types';
import {endSpan} from '@libs/telemetry/activeSpans';
import type {ReceiptFile} from '@pages/iou/request/step/IOURequestStepScan/types';
import bridgeCameraToValidation from '@pages/iou/request/step/IOURequestStepScan/utils/bridgeCameraToValidation';
import buildReceiptFiles from '@pages/iou/request/step/IOURequestStepScan/utils/buildReceiptFiles';
import getFileSource from '@pages/iou/request/step/IOURequestStepScan/utils/getFileSource';
import startScanProcessSpan from '@pages/iou/request/step/IOURequestStepScan/utils/startScanProcessSpan';
import useScanFileReadabilityCheck from '@pages/iou/request/step/IOURequestStepScan/utils/useScanFileReadabilityCheck';
import StepScreenWrapper from '@pages/iou/request/step/StepScreenWrapper';
import {setMultipleMoneyRequestParticipantsFromReport} from '@userActions/IOU';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';
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

    function navigateToConfirmationStep(files: ReceiptFile[]) {
        startScanProcessSpan();

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

    function processReceipts(files: FileObject[]) {
        if (files.length === 0) {
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

        navigateToConfirmationStep(newReceiptFiles);
    }

    const {validateFiles, PDFValidationComponent, ErrorModal} = useFilesValidation((files: FileObject[]) => {
        processReceipts(files);
    });

    function handleCapture(file: FileObject, source: string) {
        bridgeCameraToValidation(file, source, validateFiles);
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
            <View>
                {PDFValidationComponent}
                <Camera
                    // eslint-disable-next-line react/jsx-no-bind -- React Compiler handles memoization
                    onCapture={handleCapture}
                    shouldAcceptMultipleFiles={shouldAcceptMultipleFiles}
                />
                {ErrorModal}
            </View>
        </StepScreenWrapper>
    );
}

ScanFromReport.displayName = 'ScanFromReport';

export default ScanFromReport;
