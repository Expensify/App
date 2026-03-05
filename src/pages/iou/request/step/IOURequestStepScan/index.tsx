import React, {useCallback, useEffect} from 'react';
import {RESULTS} from 'react-native-permissions';
import LocationPermissionModal from '@components/LocationPermissionModal';
import withCurrentUserPersonalDetails from '@components/withCurrentUserPersonalDetails';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePolicy from '@hooks/usePolicy';
import {clearUserLocation, setUserLocation} from '@libs/actions/UserLocation';
import {isMobile} from '@libs/Browser';
import {isLocalFile as isLocalFileFileUtils} from '@libs/fileDownload/FileUtils';
import getCurrentPosition from '@libs/getCurrentPosition';
import Navigation from '@libs/Navigation/Navigation';
import {endSpan} from '@libs/telemetry/activeSpans';
import StepScreenDragAndDropWrapper from '@pages/iou/request/step/StepScreenDragAndDropWrapper';
import StepScreenWrapper from '@pages/iou/request/step/StepScreenWrapper';
import withFullTransactionOrNotFound from '@pages/iou/request/step/withFullTransactionOrNotFound';
import withWritableReportOrNotFound from '@pages/iou/request/step/withWritableReportOrNotFound';
import {checkIfScanFileCanBeRead, replaceReceipt, updateLastLocationPermissionPrompt} from '@userActions/IOU';
import {removeDraftTransactions, removeTransactionReceipt} from '@userActions/TransactionEdit';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {FileObject} from '@src/types/utils/Attachment';
import DesktopWebUploadView from './components/DesktopWebUploadView';
import MobileWebCameraView from './components/MobileWebCameraView';
import useMobileReceiptScan from './hooks/useMobileReceiptScan';
import {getLocationPermission} from './LocationPermission';
import type IOURequestStepScanProps from './types';

function IOURequestStepScan({
    report,
    route: {
        params: {action, iouType, reportID, transactionID: initialTransactionID, backTo, backToReport},
    },
    transaction: initialTransaction,
    currentUserPersonalDetails,
    onLayout,
    isMultiScanEnabled = false,
    isStartingScan = false,
    setIsMultiScanEnabled,
}: Omit<IOURequestStepScanProps, 'user'>) {
    const isMobileWeb = isMobile();
    const {translate} = useLocalize();
    const policy = usePolicy(report?.policyID);
    const [policyCategories] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${report?.policyID}`);

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
        isEditing,
        canUseMultiScan,
        isReplacingReceipt,
        shouldAcceptMultipleFiles,
        startLocationPermissionFlow,
        setStartLocationPermissionFlow,
        receiptFiles,
        setReceiptFiles,
        shouldShowMultiScanEducationalPopup,
        navigateToConfirmationStep,
        validateFiles,
        PDFValidationComponent,
        ErrorModal,
        submitReceipts,
        submitMultiScanReceipts,
        toggleMultiScan,
        dismissMultiScanEducationalPopup,
        blinkStyle,
        showBlink,
        setTestReceiptAndNavigate,
    } = useMobileReceiptScan({
        report,
        reportID,
        initialTransactionID,
        initialTransaction,
        iouType,
        action,
        currentUserPersonalDetails,
        backTo,
        backToReport,
        isMultiScanEnabled,
        isStartingScan,
        updateScanAndNavigate,
        getSource,
        setIsMultiScanEnabled,
    });

    // When the component mounts, if there is a receipt, see if the image can be read from the disk. If not, make the user star scanning flow from scratch.
    // This is because until the request is saved, the receipt file is only stored in the browsers memory as a blob:// and if the browser is refreshed, then
    // the image ceases to exist. The best way for the user to recover from this is to start over from the start of the request process.
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
            setIsMultiScanEnabled?.(false);
            removeTransactionReceipt(CONST.IOU.OPTIMISTIC_TRANSACTION_ID);
            removeDraftTransactions(true);
        });
        // We want this hook to run on mounting only
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

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

    const locationPermissionModal = startLocationPermissionFlow && !!receiptFiles.length && (
        <LocationPermissionModal
            startPermissionFlow={startLocationPermissionFlow}
            resetPermissionFlow={() => setStartLocationPermissionFlow(false)}
            onGrant={() => navigateToConfirmationStep(receiptFiles, true)}
            onDeny={() => {
                updateLastLocationPermissionPrompt();
                navigateToConfirmationStep(receiptFiles, false);
            }}
        />
    );

    if (isMobileWeb) {
        return (
            <StepScreenWrapper
                headerTitle={translate('common.receipt')}
                onBackButtonPress={navigateBack}
                shouldShowWrapper={!!backTo || isEditing}
                testID="IOURequestStepScan"
            >
                <>
                    <MobileWebCameraView
                        PDFValidationComponent={PDFValidationComponent}
                        shouldAcceptMultipleFiles={shouldAcceptMultipleFiles}
                        isMultiScanEnabled={isMultiScanEnabled}
                        canUseMultiScan={canUseMultiScan}
                        blinkStyle={blinkStyle}
                        showBlink={showBlink}
                        shouldShowMultiScanEducationalPopup={shouldShowMultiScanEducationalPopup}
                        initialTransactionID={initialTransactionID}
                        initialTransaction={initialTransaction}
                        currentUserPersonalDetails={currentUserPersonalDetails}
                        reportID={reportID}
                        receiptFiles={receiptFiles}
                        isEditing={isEditing}
                        onLayout={() => onLayout?.(setTestReceiptAndNavigate)}
                        validateFiles={validateFiles}
                        toggleMultiScan={toggleMultiScan}
                        dismissMultiScanEducationalPopup={dismissMultiScanEducationalPopup}
                        submitMultiScanReceipts={submitMultiScanReceipts}
                        setReceiptFiles={setReceiptFiles}
                        updateScanAndNavigate={updateScanAndNavigate}
                        submitReceipts={submitReceipts}
                    />
                    {ErrorModal}
                    {locationPermissionModal}
                </>
            </StepScreenWrapper>
        );
    }

    return (
        <StepScreenDragAndDropWrapper
            headerTitle={translate('common.receipt')}
            onBackButtonPress={navigateBack}
            shouldShowWrapper={!!backTo || isEditing}
            testID="IOURequestStepScan"
        >
            <>
                <DesktopWebUploadView
                    PDFValidationComponent={PDFValidationComponent}
                    shouldAcceptMultipleFiles={shouldAcceptMultipleFiles}
                    isReplacingReceipt={isReplacingReceipt}
                    onLayout={() => onLayout?.(setTestReceiptAndNavigate)}
                    validateFiles={validateFiles}
                />
                {ErrorModal}
                {locationPermissionModal}
            </>
        </StepScreenDragAndDropWrapper>
    );
}

const IOURequestStepScanWithCurrentUserPersonalDetails = withCurrentUserPersonalDetails(IOURequestStepScan);
// eslint-disable-next-line rulesdir/no-negated-variables
const IOURequestStepScanWithWritableReportOrNotFound = withWritableReportOrNotFound(IOURequestStepScanWithCurrentUserPersonalDetails, true);
// eslint-disable-next-line rulesdir/no-negated-variables
const IOURequestStepScanWithFullTransactionOrNotFound = withFullTransactionOrNotFound(IOURequestStepScanWithWritableReportOrNotFound);

export default IOURequestStepScanWithFullTransactionOrNotFound;
