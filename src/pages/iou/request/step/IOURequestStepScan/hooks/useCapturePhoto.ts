import type {RefObject} from 'react';
import {useRef} from 'react';
import {Alert} from 'react-native';
import {RESULTS} from 'react-native-permissions';
import type {Camera, PhotoFile} from 'react-native-vision-camera';
import useLocalize from '@hooks/useLocalize';
import {pregenerateThumbnail} from '@hooks/useLocalReceiptThumbnail';
import getPhotoSource from '@libs/fileDownload/getPhotoSource';
import getReceiptsUploadFolderPath from '@libs/getReceiptsUploadFolderPath';
import Log from '@libs/Log';
import {cancelSpan, endSpan, getSpan, startSpan} from '@libs/telemetry/activeSpans';
import captureReceipt from '@pages/iou/request/step/IOURequestStepScan/captureReceipt';
import type {ReceiptFile} from '@pages/iou/request/step/IOURequestStepScan/types';
import {setMoneyRequestReceipt} from '@userActions/IOU/Receipt';
import {buildOptimisticTransactionAndCreateDraft} from '@userActions/TransactionEdit';
import CONST from '@src/CONST';
import type {CurrentUserPersonalDetails} from '@src/types/onyx/PersonalDetails';
import type Transaction from '@src/types/onyx/Transaction';
import type {FileObject} from '@src/types/utils/Attachment';

type UseCapturePhotoParams = {
    /** Ref to the underlying Camera instance */
    cameraRef: RefObject<Camera | null>;

    /** Current camera permission status from react-native-permissions */
    cameraPermissionStatus: string | null;

    /** Whether the camera flash is currently on */
    flash: boolean;

    /** Whether the camera device supports flash */
    hasFlash: boolean;

    /** Whether the platform requires muted audio during capture */
    isPlatformMuted: boolean | undefined;

    /** Whether the device is currently in landscape orientation */
    isInLandscapeMode: boolean;

    /** Prompts the user to grant camera permissions */
    askForPermissions: () => void;

    /** Sets whether a photo has been captured */
    setDidCapturePhoto: (value: boolean) => void;

    /** Whether multi-scan mode is currently active */
    isMultiScanEnabled: boolean;

    /** Whether the user is editing an existing receipt */
    isEditing: boolean;

    /** The initial transaction associated with this scan */
    initialTransaction: Transaction | null | undefined;

    /** The transaction ID to use when no optimistic transaction is created */
    initialTransactionID: string;

    /** The current user's personal details for optimistic transaction creation */
    currentUserPersonalDetails: CurrentUserPersonalDetails;

    /** The report ID associated with this expense */
    reportID: string;

    /** Array of receipt files captured so far in the current session */
    receiptFiles: ReceiptFile[];

    /** Updates the array of captured receipt files */
    setReceiptFiles: (value: ReceiptFile[]) => void;

    /** Replaces the receipt on an existing transaction and navigates back */
    updateScanAndNavigate: (file: FileObject, source: string) => void;

    /** Submits all captured receipts and navigates to the confirmation step */
    submitReceipts: (files: ReceiptFile[]) => void;

    /** Triggers the post-capture blink animation */
    showBlink: () => void;
};

/**
 * Encapsulates the capturePhoto function: permission guard, telemetry spans,
 * photo capture call, multi-scan vs. single-scan branching, editing vs. new-receipt
 * branching, optimistic transaction creation, and Onyx receipt merges.
 */
function useCapturePhoto({
    cameraRef,
    cameraPermissionStatus,
    flash,
    hasFlash,
    isPlatformMuted,
    isInLandscapeMode,
    askForPermissions,
    setDidCapturePhoto,
    isMultiScanEnabled,
    isEditing,
    initialTransaction,
    initialTransactionID,
    currentUserPersonalDetails,
    reportID,
    receiptFiles,
    setReceiptFiles,
    updateScanAndNavigate,
    submitReceipts,
    showBlink,
}: UseCapturePhotoParams) {
    const {translate} = useLocalize();
    const isCapturingPhoto = useRef(false);

    const resetCapturingState = () => {
        isCapturingPhoto.current = false;
    };

    const maybeCancelShutterSpan = () => {
        if (isMultiScanEnabled) {
            return;
        }

        cancelSpan(CONST.TELEMETRY.SPAN_RECEIPT_CAPTURE);
        cancelSpan(CONST.TELEMETRY.SPAN_SHUTTER_TO_CONFIRMATION);
    };

    const capturePhoto = () => {
        if (!isMultiScanEnabled) {
            startSpan(CONST.TELEMETRY.SPAN_SHUTTER_TO_CONFIRMATION, {
                name: CONST.TELEMETRY.SPAN_SHUTTER_TO_CONFIRMATION,
                op: CONST.TELEMETRY.SPAN_SHUTTER_TO_CONFIRMATION,
                attributes: {[CONST.TELEMETRY.ATTRIBUTE_PLATFORM]: 'native'},
            });
        }

        if (!cameraRef.current && (cameraPermissionStatus === RESULTS.DENIED || cameraPermissionStatus === RESULTS.BLOCKED)) {
            maybeCancelShutterSpan();
            askForPermissions();
            return;
        }

        const showCameraAlert = () => {
            Alert.alert(translate('receipt.cameraErrorTitle'), translate('receipt.cameraErrorMessage'));
        };

        if (!cameraRef.current) {
            maybeCancelShutterSpan();
            showCameraAlert();
            return;
        }

        if (isCapturingPhoto.current) {
            maybeCancelShutterSpan();
            return;
        }

        startSpan(CONST.TELEMETRY.SPAN_RECEIPT_CAPTURE, {
            name: CONST.TELEMETRY.SPAN_RECEIPT_CAPTURE,
            op: CONST.TELEMETRY.SPAN_RECEIPT_CAPTURE,
            parentSpan: getSpan(CONST.TELEMETRY.SPAN_SHUTTER_TO_CONFIRMATION),
            attributes: {[CONST.TELEMETRY.ATTRIBUTE_PLATFORM]: 'native'},
        });

        isCapturingPhoto.current = true;
        showBlink();

        const path = getReceiptsUploadFolderPath();

        captureReceipt(cameraRef.current, {flash, hasFlash, isPlatformMuted, path, isInLandscapeMode})
            .then((photo: PhotoFile) => {
                setDidCapturePhoto(true);

                const transaction =
                    isMultiScanEnabled && initialTransaction?.receipt?.source
                        ? buildOptimisticTransactionAndCreateDraft({
                              initialTransaction,
                              currentUserPersonalDetails,
                              reportID,
                          })
                        : initialTransaction;
                const transactionID = transaction?.transactionID ?? initialTransactionID;
                const source = getPhotoSource(photo.path);
                const filename = photo.path;

                endSpan(CONST.TELEMETRY.SPAN_RECEIPT_CAPTURE);

                const cameraFile = {
                    uri: source,
                    name: filename,
                    type: 'image/jpeg',
                    source,
                };

                if (isEditing) {
                    setMoneyRequestReceipt(transactionID, source, filename, !isEditing, 'image/jpeg');
                    updateScanAndNavigate(cameraFile as FileObject, source);
                    return;
                }

                const newReceiptFiles = [...receiptFiles, {file: cameraFile as FileObject, source, transactionID}];
                setReceiptFiles(newReceiptFiles);

                if (isMultiScanEnabled) {
                    setMoneyRequestReceipt(transactionID, source, filename, !isEditing, 'image/jpeg');
                    setDidCapturePhoto(false);
                    isCapturingPhoto.current = false;
                    return;
                }

                // Fire Onyx merge immediately (non-blocking) while we await thumbnail generation.
                // Both run in parallel — navigation proceeds once the thumbnail is cached.
                setMoneyRequestReceipt(transactionID, source, filename, !isEditing, 'image/jpeg');
                pregenerateThumbnail(source).then(() => {
                    submitReceipts(newReceiptFiles);
                });
            })
            .catch((error: string) => {
                isCapturingPhoto.current = false;
                cancelSpan(CONST.TELEMETRY.SPAN_RECEIPT_CAPTURE);
                maybeCancelShutterSpan();
                showCameraAlert();
                Log.warn('Error taking photo', error);
            });
    };

    return {capturePhoto, resetCapturingState};
}

export default useCapturePhoto;
