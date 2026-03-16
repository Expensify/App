import {useRoute} from '@react-navigation/native';
import noop from 'lodash/noop';
import React, {useEffect, useState} from 'react';
import {RESULTS} from 'react-native-permissions';
import TestReceipt from '@assets/images/fake-receipt.png';
import LocationPermissionModal from '@components/LocationPermissionModal';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useDefaultExpensePolicy from '@hooks/useDefaultExpensePolicy';
import useFilesValidation from '@hooks/useFilesValidation';
import useOnyx from '@hooks/useOnyx';
import useOptimisticDraftTransactions from '@hooks/useOptimisticDraftTransactions';
import usePersonalPolicy from '@hooks/usePersonalPolicy';
import useSelfDMReport from '@hooks/useSelfDMReport';
import setTestReceipt from '@libs/actions/setTestReceipt';
import {clearUserLocation, setUserLocation} from '@libs/actions/UserLocation';
import {isMobile} from '@libs/Browser';
import {isLocalFile as isLocalFileFileUtils} from '@libs/fileDownload/FileUtils';
import getCurrentPosition from '@libs/getCurrentPosition';
import {navigateToConfirmationPage, navigateToParticipantPage} from '@libs/IOUUtils';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackRouteProp} from '@libs/Navigation/PlatformStackNavigation/types';
import type {MoneyRequestNavigatorParamList} from '@libs/Navigation/types';
import {getPolicyExpenseChat, isSelfDM} from '@libs/ReportUtils';
import shouldUseDefaultExpensePolicy from '@libs/shouldUseDefaultExpensePolicy';
import {endSpan, getSpan, startSpan} from '@libs/telemetry/activeSpans';
import {hasReceipt, shouldReuseInitialTransaction} from '@libs/TransactionUtils';
import {getLocationPermission} from '@pages/iou/request/step/IOURequestStepScan/LocationPermission';
import type {ReceiptFile} from '@pages/iou/request/step/IOURequestStepScan/types';
import {checkIfScanFileCanBeRead, setMoneyRequestParticipants, setMoneyRequestParticipantsFromReport, setMoneyRequestReceipt, updateLastLocationPermissionPrompt} from '@userActions/IOU';
import {setTransactionReport} from '@userActions/Transaction';
import {buildOptimisticTransactionAndCreateDraft, removeDraftTransactions, removeTransactionReceipt} from '@userActions/TransactionEdit';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type Transaction from '@src/types/onyx/Transaction';
import type {FileObject} from '@src/types/utils/Attachment';
import DesktopWebUploadView from './DesktopWebUploadView';
import MobileWebCameraView from './MobileWebCameraView';

/**
 * ScanGlobalCreate — global create flow.
 * Used when isFromGlobalCreate / archived / CREATE type.
 *
 * Press handler: shouldUseDefaultExpensePolicy -> determine target -> set participants -> navigate
 */
function ScanGlobalCreate() {
    const route = useRoute<PlatformStackRouteProp<MoneyRequestNavigatorParamList, typeof SCREENS.MONEY_REQUEST.STEP_SCAN>>();
    const {action, iouType, reportID, transactionID: initialTransactionID, backTo, backToReport} = route.params;

    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const [initialTransaction] = useOnyx(`${ONYXKEYS.COLLECTION.TRANSACTION}${initialTransactionID}`);
    const [transactions] = useOptimisticDraftTransactions(initialTransaction);

    const defaultExpensePolicy = useDefaultExpensePolicy();
    const personalPolicy = usePersonalPolicy();
    const selfDMReport = useSelfDMReport();
    const [amountOwed] = useOnyx(ONYXKEYS.NVP_PRIVATE_AMOUNT_OWED);

    const isMobileWeb = isMobile();

    const isEditing = action === CONST.IOU.ACTION.EDIT;
    const isReplacingReceipt = (isEditing && hasReceipt(initialTransaction)) || (!!initialTransaction?.receipt && !!backTo);
    const shouldAcceptMultipleFiles = !isEditing && !backTo;

    const [startLocationPermissionFlow, setStartLocationPermissionFlow] = useState(false);
    const [receiptFiles, setReceiptFiles] = useState<ReceiptFile[]>([]);

    const navigateBack = () => {
        Navigation.goBack(backTo);
    };

    const getSource = (file: FileObject) => file.uri ?? URL.createObjectURL(file as Blob);

    // The extra params satisfy the MobileWebCameraView prop contract but are not used by this variant
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

        // Global create never skips confirmation in this variant
        navigateToConfirmationStep(newReceiptFiles, false);
    }

    const {validateFiles, PDFValidationComponent, ErrorModal} = useFilesValidation((files: FileObject[]) => {
        processReceipts(files, getSource);
    });

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

    // Pre-fetch location on web if permission already granted
    useEffect(() => {
        const gpsRequired = initialTransaction?.amount === 0 && iouType !== CONST.IOU.TYPE.SPLIT;
        if (!gpsRequired) {
            return;
        }

        getLocationPermission().then((status) => {
            if (status !== RESULTS.GRANTED && status !== RESULTS.LIMITED) {
                return;
            }
            clearUserLocation();
            getCurrentPosition(
                (successData) => {
                    setUserLocation({longitude: successData.coords.longitude, latitude: successData.coords.latitude});
                },
                () => {},
            );
        });
    }, [initialTransaction?.amount, iouType]);

    return (
        <>
            {isMobileWeb ? (
                <MobileWebCameraView
                    initialTransaction={initialTransaction}
                    initialTransactionID={initialTransactionID}
                    iouType={iouType}
                    currentUserPersonalDetails={currentUserPersonalDetails}
                    reportID={reportID}
                    isMultiScanEnabled={false}
                    isStartingScan={false}
                    updateScanAndNavigate={noop}
                    setIsMultiScanEnabled={undefined}
                    PDFValidationComponent={PDFValidationComponent}
                    shouldAcceptMultipleFiles={shouldAcceptMultipleFiles}
                    receiptFiles={receiptFiles}
                    isEditing={isEditing}
                    validateFiles={validateFiles}
                    setReceiptFiles={setReceiptFiles}
                    // eslint-disable-next-line react/jsx-no-bind -- React Compiler handles memoization
                    navigateToConfirmationStep={navigateToConfirmationStep}
                    shouldSkipConfirmation={false}
                    setStartLocationPermissionFlow={setStartLocationPermissionFlow}
                    onBackButtonPress={navigateBack}
                    shouldShowWrapper={!!backTo || isEditing}
                />
            ) : (
                <DesktopWebUploadView
                    PDFValidationComponent={PDFValidationComponent}
                    shouldAcceptMultipleFiles={shouldAcceptMultipleFiles}
                    isReplacingReceipt={isReplacingReceipt}
                    onLayout={noop}
                    validateFiles={validateFiles}
                    onBackButtonPress={navigateBack}
                    shouldShowWrapper={!!backTo || isEditing}
                />
            )}
            {ErrorModal}
            {startLocationPermissionFlow && !!receiptFiles.length && (
                <LocationPermissionModal
                    startPermissionFlow={startLocationPermissionFlow}
                    resetPermissionFlow={() => setStartLocationPermissionFlow(false)}
                    onGrant={() => navigateToConfirmationStep(receiptFiles, true)}
                    onDeny={() => {
                        updateLastLocationPermissionPrompt();
                        navigateToConfirmationStep(receiptFiles, false);
                    }}
                />
            )}
        </>
    );
}

ScanGlobalCreate.displayName = 'ScanGlobalCreate';

export default ScanGlobalCreate;
