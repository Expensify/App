import {useRoute} from '@react-navigation/native';
import React, {useEffect} from 'react';
import {View} from 'react-native';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useDefaultExpensePolicy from '@hooks/useDefaultExpensePolicy';
import useFilesValidation from '@hooks/useFilesValidation';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useOptimisticDraftTransactions from '@hooks/useOptimisticDraftTransactions';
import usePersonalPolicy from '@hooks/usePersonalPolicy';
import useSelfDMReport from '@hooks/useSelfDMReport';
import {navigateToConfirmationPage, navigateToParticipantPage} from '@libs/IOUUtils';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackRouteProp} from '@libs/Navigation/PlatformStackNavigation/types';
import type {MoneyRequestNavigatorParamList} from '@libs/Navigation/types';
import {getPolicyExpenseChat, isSelfDM} from '@libs/ReportUtils';
import shouldUseDefaultExpensePolicy from '@libs/shouldUseDefaultExpensePolicy';
import {endSpan} from '@libs/telemetry/activeSpans';
import type {ReceiptFile} from '@pages/iou/request/step/IOURequestStepScan/types';
import bridgeCameraToValidation from '@pages/iou/request/step/IOURequestStepScan/utils/bridgeCameraToValidation';
import buildReceiptFiles from '@pages/iou/request/step/IOURequestStepScan/utils/buildReceiptFiles';
import createTestReceiptHandler from '@pages/iou/request/step/IOURequestStepScan/utils/createTestReceiptHandler';
import getFileSource from '@pages/iou/request/step/IOURequestStepScan/utils/getFileSource';
import startScanProcessSpan from '@pages/iou/request/step/IOURequestStepScan/utils/startScanProcessSpan';
import useScanFileReadabilityCheck from '@pages/iou/request/step/IOURequestStepScan/utils/useScanFileReadabilityCheck';
import StepScreenWrapper from '@pages/iou/request/step/StepScreenWrapper';
import {setMoneyRequestParticipants, setMoneyRequestParticipantsFromReport} from '@userActions/IOU';
import {setTransactionReport} from '@userActions/Transaction';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type {FileObject} from '@src/types/utils/Attachment';
import Camera from './Camera';

type ScanGlobalCreateProps = {
    onLayout?: (handler: () => void) => void;
};

/**
 * ScanGlobalCreate — global create flow.
 * Used when isFromGlobalCreate / archived / CREATE type.
 *
 * Press handler: shouldUseDefaultExpensePolicy -> determine target -> set participants -> navigate
 */
function ScanGlobalCreate({onLayout}: ScanGlobalCreateProps) {
    const route = useRoute<PlatformStackRouteProp<MoneyRequestNavigatorParamList, typeof SCREENS.MONEY_REQUEST.STEP_SCAN>>();
    const {action, iouType, reportID, transactionID: initialTransactionID, backTo, backToReport} = route.params;

    const {translate} = useLocalize();
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const [initialTransaction] = useOnyx(`${ONYXKEYS.COLLECTION.TRANSACTION}${initialTransactionID}`);
    const [transactions] = useOptimisticDraftTransactions(initialTransaction);

    const defaultExpensePolicy = useDefaultExpensePolicy();
    const personalPolicy = usePersonalPolicy();
    const selfDMReport = useSelfDMReport();
    const [amountOwed] = useOnyx(ONYXKEYS.NVP_PRIVATE_AMOUNT_OWED);

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

        // Global create flow: determine target based on defaultExpensePolicy
        if (shouldUseDefaultExpensePolicy(iouType, defaultExpensePolicy, amountOwed)) {
            const isAutoReporting = !!personalPolicy?.autoReporting;
            const shouldAutoReport = !!defaultExpensePolicy?.autoReporting || isAutoReporting;
            const targetReport = shouldAutoReport ? getPolicyExpenseChat(currentUserPersonalDetails.accountID, defaultExpensePolicy?.id) : selfDMReport;
            const transactionReportID = isSelfDM(targetReport) ? CONST.REPORT.UNREPORTED_REPORT_ID : targetReport?.reportID;
            const iouTypeTrackOrSubmit = transactionReportID === CONST.REPORT.UNREPORTED_REPORT_ID ? CONST.IOU.TYPE.TRACK : CONST.IOU.TYPE.SUBMIT;

            // If the initial transaction has different participants selected, the user changed the participant in the confirmation step
            if (initialTransaction?.participants && initialTransaction?.participants?.at(0)?.reportID !== targetReport?.reportID) {
                const isTrackExpense = initialTransaction?.participants?.at(0)?.reportID === selfDMReport?.reportID;

                const setParticipantsPromises = files.map((receiptFile) => setMoneyRequestParticipants(receiptFile.transactionID, initialTransaction?.participants));
                Promise.all(setParticipantsPromises).then(() => {
                    if (isTrackExpense) {
                        Navigation.navigate(ROUTES.MONEY_REQUEST_STEP_CONFIRMATION.getRoute(CONST.IOU.ACTION.CREATE, CONST.IOU.TYPE.TRACK, initialTransactionID, selfDMReport?.reportID));
                    } else {
                        navigateToConfirmationPage(iouType, initialTransactionID, reportID, backToReport, iouType === CONST.IOU.TYPE.CREATE, initialTransaction?.reportID);
                    }
                });
                return;
            }

            const setParticipantsPromises = files.map((receiptFile) => {
                setTransactionReport(receiptFile.transactionID, {reportID: transactionReportID}, true);
                return setMoneyRequestParticipantsFromReport(receiptFile.transactionID, targetReport, currentUserPersonalDetails.accountID);
            });
            Promise.all(setParticipantsPromises).then(() =>
                Navigation.navigate(ROUTES.MONEY_REQUEST_STEP_CONFIRMATION.getRoute(CONST.IOU.ACTION.CREATE, iouTypeTrackOrSubmit, initialTransactionID, targetReport?.reportID)),
            );
        } else {
            navigateToParticipantPage(iouType, initialTransactionID, reportID);
        }
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

    const testReceiptHandler = createTestReceiptHandler(initialTransactionID, isEditing, navigateToConfirmationStep);

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
            <View onLayout={() => onLayout?.(testReceiptHandler)}>
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

ScanGlobalCreate.displayName = 'ScanGlobalCreate';

export default ScanGlobalCreate;
