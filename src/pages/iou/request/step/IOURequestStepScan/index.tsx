import React, {useCallback, useEffect, useRef} from 'react';
import {RESULTS} from 'react-native-permissions';
import LocationPermissionModal from '@components/LocationPermissionModal';
import withCurrentUserPersonalDetails from '@components/withCurrentUserPersonalDetails';
import useOnyx from '@hooks/useOnyx';
import usePolicy from '@hooks/usePolicy';
import {clearUserLocation, setUserLocation} from '@libs/actions/UserLocation';
import {isMobile} from '@libs/Browser';
import {isLocalFile as isLocalFileFileUtils} from '@libs/fileDownload/FileUtils';
import getCurrentPosition from '@libs/getCurrentPosition';
import Navigation from '@libs/Navigation/Navigation';
import {endSpan} from '@libs/telemetry/activeSpans';
import withFullTransactionOrNotFound from '@pages/iou/request/step/withFullTransactionOrNotFound';
import withWritableReportOrNotFound from '@pages/iou/request/step/withWritableReportOrNotFound';
import {updateLastLocationPermissionPrompt} from '@userActions/IOU';
import {checkIfLocalFileIsAccessible, replaceReceipt} from '@userActions/IOU/Receipt';
import {removeDraftTransactionsByIDs, removeTransactionReceipt} from '@userActions/TransactionEdit';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import {validTransactionDraftIDsSelector} from '@src/selectors/TransactionDraft';
import type {FileObject} from '@src/types/utils/Attachment';
import DesktopWebUploadView from './components/DesktopWebUploadView';
import MobileWebCameraView from './components/MobileWebCameraView';
import useReceiptScan from './hooks/useReceiptScan';
import {getLocationPermission} from './LocationPermission';
import type IOURequestStepScanProps from './types';

function IOURequestStepScan({
    report,
    route: {
        name: routeName,
        params: {action, iouType, reportID, transactionID: initialTransactionID, backTo, backToReport},
    },
    transaction: initialTransaction,
    currentUserPersonalDetails,
    onLayout,
}: Omit<IOURequestStepScanProps, 'user'>) {
    const isMobileWeb = isMobile();
    const policy = usePolicy(report?.policyID);
    const [policyCategories] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${report?.policyID}`);
    const [draftTransactionIDs] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION_DRAFT, {selector: validTransactionDraftIDsSelector});

    // End the create expense span on mount for web (no camera init tracking needed)
    useEffect(() => {
        endSpan(CONST.TELEMETRY.SPAN_OPEN_CREATE_EXPENSE);
    }, []);

    const navigateBack = useCallback(() => {
        Navigation.goBack(backTo);
    }, [backTo]);

    const updateScanAndNavigate = useCallback(
        (file: FileObject, source: string) => {
            replaceReceipt({transactionID: initialTransactionID, file: file as File, source, transactionPolicy: policy, transactionPolicyCategories: policyCategories});
            navigateBack();
        },
        [initialTransactionID, navigateBack, policy, policyCategories],
    );

    const getSource = useCallback((file: FileObject) => file.uri ?? URL.createObjectURL(file as Blob), []);

    const {
        transactions,
        isMultiScanEnabled,
        setIsMultiScanEnabled,
        isStartingScan,
        isEditing,
        isReplacingReceipt,
        shouldAcceptMultipleFiles,
        shouldSkipConfirmation,
        startLocationPermissionFlow,
        setStartLocationPermissionFlow,
        receiptFiles,
        setReceiptFiles,
        navigateToConfirmationStep,
        validateFiles,
        PDFValidationComponent,
        ErrorModal,
        setTestReceiptAndNavigate,
    } = useReceiptScan({
        report,
        reportID,
        initialTransactionID,
        initialTransaction,
        iouType,
        action,
        currentUserPersonalDetails,
        backTo,
        backToReport,
        routeName,
        updateScanAndNavigate,
        getSource,
    });

    const handleOnLayout = useCallback(() => {
        onLayout?.(setTestReceiptAndNavigate);
    }, [onLayout, setTestReceiptAndNavigate]);

    const hasValidatedInitialScanFiles = useRef(false);

    // When the component mounts, if there is a receipt, see if the image can be read from the disk. If not, make the user start scanning flow from scratch.
    // This is because until the request is saved, the receipt file is only stored in the browsers memory as a blob:// and if the browser is refreshed, then
    // the image ceases to exist. The best way for the user to recover from this is to start over from the start of the request process.
    useEffect(() => {
        if (hasValidatedInitialScanFiles.current) {
            return;
        }
        hasValidatedInitialScanFiles.current = true;

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

                return checkIfLocalFileIsAccessible(item.receipt?.filename, itemReceiptPath, item.receipt?.type, () => {}, onFailure);
            }),
        ).then(() => {
            if (isAllScanFilesCanBeRead) {
                return;
            }
            setIsMultiScanEnabled(false);
            removeTransactionReceipt(CONST.IOU.OPTIMISTIC_TRANSACTION_ID);
            removeDraftTransactionsByIDs(draftTransactionIDs, true);
        });
    }, [setIsMultiScanEnabled, transactions, draftTransactionIDs]);

    // this effect will pre-fetch location in web if the location permission is already granted to optimize the flow
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
                    isMultiScanEnabled={isMultiScanEnabled}
                    isStartingScan={isStartingScan}
                    updateScanAndNavigate={updateScanAndNavigate}
                    setIsMultiScanEnabled={setIsMultiScanEnabled}
                    PDFValidationComponent={PDFValidationComponent}
                    shouldAcceptMultipleFiles={shouldAcceptMultipleFiles}
                    receiptFiles={receiptFiles}
                    isEditing={isEditing}
                    validateFiles={validateFiles}
                    setReceiptFiles={setReceiptFiles}
                    navigateToConfirmationStep={navigateToConfirmationStep}
                    shouldSkipConfirmation={shouldSkipConfirmation}
                    setStartLocationPermissionFlow={setStartLocationPermissionFlow}
                    onLayout={handleOnLayout}
                    onBackButtonPress={navigateBack}
                    shouldShowWrapper={!!backTo || isEditing}
                />
            ) : (
                <DesktopWebUploadView
                    PDFValidationComponent={PDFValidationComponent}
                    shouldAcceptMultipleFiles={shouldAcceptMultipleFiles}
                    isReplacingReceipt={isReplacingReceipt}
                    onLayout={handleOnLayout}
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

const IOURequestStepScanWithCurrentUserPersonalDetails = withCurrentUserPersonalDetails(IOURequestStepScan);
// eslint-disable-next-line rulesdir/no-negated-variables
const IOURequestStepScanWithWritableReportOrNotFound = withWritableReportOrNotFound(IOURequestStepScanWithCurrentUserPersonalDetails, true);
// eslint-disable-next-line rulesdir/no-negated-variables
const IOURequestStepScanWithFullTransactionOrNotFound = withFullTransactionOrNotFound(IOURequestStepScanWithWritableReportOrNotFound);

export default IOURequestStepScanWithFullTransactionOrNotFound;
