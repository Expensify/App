import {useRoute} from '@react-navigation/native';
import shouldStartLocationPermissionFlowSelector from '@selectors/LocationPermission';
import noop from 'lodash/noop';
import React, {useEffect, useState} from 'react';
import {RESULTS} from 'react-native-permissions';
import TestReceipt from '@assets/images/fake-receipt.png';
import LocationPermissionModal from '@components/LocationPermissionModal';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useFilesValidation from '@hooks/useFilesValidation';
import useOnyx from '@hooks/useOnyx';
import useOptimisticDraftTransactions from '@hooks/useOptimisticDraftTransactions';
import usePolicy from '@hooks/usePolicy';
import setTestReceipt from '@libs/actions/setTestReceipt';
import {clearUserLocation, setUserLocation} from '@libs/actions/UserLocation';
import {isMobile} from '@libs/Browser';
import {isLocalFile as isLocalFileFileUtils} from '@libs/fileDownload/FileUtils';
import getCurrentPosition from '@libs/getCurrentPosition';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackRouteProp} from '@libs/Navigation/PlatformStackNavigation/types';
import type {MoneyRequestNavigatorParamList} from '@libs/Navigation/types';
import {endSpan, getSpan, startSpan} from '@libs/telemetry/activeSpans';
import {hasReceipt} from '@libs/TransactionUtils';
import {getLocationPermission} from '@pages/iou/request/step/IOURequestStepScan/LocationPermission';
import type {ReceiptFile} from '@pages/iou/request/step/IOURequestStepScan/types';
import {checkIfScanFileCanBeRead, replaceReceipt, setMoneyRequestReceipt, updateLastLocationPermissionPrompt} from '@userActions/IOU';
import {removeDraftTransactions, removeTransactionReceipt} from '@userActions/TransactionEdit';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';
import type {FileObject} from '@src/types/utils/Attachment';
import DesktopWebUploadView from './DesktopWebUploadView';
import MobileWebCameraView from './MobileWebCameraView';

/**
 * ScanEditReceipt — the simplest scan variant.
 * Used when the user is editing/replacing an existing receipt (backTo or isEditing).
 *
 * Press handler: replaceReceipt -> navigateBack
 */
function ScanEditReceipt() {
    const route = useRoute<PlatformStackRouteProp<MoneyRequestNavigatorParamList, typeof SCREENS.MONEY_REQUEST.STEP_SCAN>>();
    const {action, iouType, reportID, transactionID: initialTransactionID, backTo} = route.params;

    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`);
    const policy = usePolicy(report?.policyID);
    const [policyCategories] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${report?.policyID}`);
    const [initialTransaction] = useOnyx(`${ONYXKEYS.COLLECTION.TRANSACTION}${initialTransactionID}`);
    const [transactions] = useOptimisticDraftTransactions(initialTransaction);

    const [shouldStartLocationPermissionFlow] = useOnyx(ONYXKEYS.NVP_LAST_LOCATION_PERMISSION_PROMPT, {
        selector: shouldStartLocationPermissionFlowSelector,
    });

    const isMobileWeb = isMobile();

    const isEditing = action === CONST.IOU.ACTION.EDIT;
    const isReplacingReceipt = (isEditing && hasReceipt(initialTransaction)) || (!!initialTransaction?.receipt && !!backTo);
    const shouldAcceptMultipleFiles = false; // editing never accepts multiple files

    const [startLocationPermissionFlow, setStartLocationPermissionFlow] = useState(false);
    const [receiptFiles, setReceiptFiles] = useState<ReceiptFile[]>([]);

    const navigateBack = () => {
        Navigation.goBack(backTo);
    };

    const updateScanAndNavigate = (file: FileObject, source: string) => {
        replaceReceipt({transactionID: initialTransactionID, file: file as File, source, transactionPolicy: policy, transactionPolicyCategories: policyCategories});
        navigateBack();
    };

    const getSource = (file: FileObject) => file.uri ?? URL.createObjectURL(file as Blob);

    // The extra params satisfy the MobileWebCameraView prop contract
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    function navigateToConfirmationStep(files: ReceiptFile[], locationPermissionGranted = false, _isTestTransaction = false) {
        startSpan(CONST.TELEMETRY.SPAN_SCAN_PROCESS_AND_NAVIGATE, {
            name: CONST.TELEMETRY.SPAN_SCAN_PROCESS_AND_NAVIGATE,
            op: CONST.TELEMETRY.SPAN_SCAN_PROCESS_AND_NAVIGATE,
            parentSpan: getSpan(CONST.TELEMETRY.SPAN_SHUTTER_TO_CONFIRMATION),
            attributes: {[CONST.TELEMETRY.ATTRIBUTE_IS_MULTI_SCAN]: false},
        });

        // For edit variant, backTo is always set — just navigate back
        if (backTo) {
            Navigation.goBack(backTo);
            return;
        }

        // Fallback: GPS location permission flow
        const gpsRequired = initialTransaction?.amount === 0 && iouType !== CONST.IOU.TYPE.SPLIT && files.length > 0;
        if (gpsRequired && !locationPermissionGranted) {
            if (shouldStartLocationPermissionFlow) {
                setStartLocationPermissionFlow(true);
                setReceiptFiles(files);
                return;
            }
        }

        Navigation.goBack(backTo);
    }

    function processReceipts(files: FileObject[], getFileSource: (file: FileObject) => string) {
        if (files.length === 0) {
            return;
        }

        // For editing, just replace the receipt
        const file = files.at(0);
        if (!file) {
            return;
        }
        const source = getFileSource(file);
        setMoneyRequestReceipt(initialTransactionID, source, file.name ?? '', !isEditing, file.type);
        updateScanAndNavigate(file, source);
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
                    updateScanAndNavigate={updateScanAndNavigate}
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

ScanEditReceipt.displayName = 'ScanEditReceipt';

export default ScanEditReceipt;
