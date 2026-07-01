import {useEffect, useRef} from 'react';
import ReactNativeBlobUtil from 'react-native-blob-util';
import {RESULTS} from 'react-native-permissions';
import type {CameraDevice} from 'react-native-vision-camera';
import getReceiptsUploadFolderPath from '@libs/getReceiptsUploadFolderPath';
import Log from '@libs/Log';
import {cancelSpan, endSpan, getSpan, startSpan} from '@libs/telemetry/activeSpans';
import CONST from '@src/CONST';

type UseCameraInitTelemetryParams = {
    /** Current camera permission status from react-native-permissions */
    cameraPermissionStatus: string | null;

    /** The active camera device descriptor, undefined while loading */
    device: CameraDevice | undefined;
};

/**
 * Manages camera initialization telemetry spans: CAMERA_INIT and OPEN_CREATE_EXPENSE.
 * Handles starting spans when permission is granted, cancelling when denied,
 * and cleaning up on unmount.
 */
function useCameraInitTelemetry({cameraPermissionStatus, device}: UseCameraInitTelemetryParams) {
    const cameraInitSpanStarted = useRef(false);
    const cameraInitialized = useRef(false);

    // End navigation span and start ready span on mount
    useEffect(() => {
        endSpan(CONST.TELEMETRY.SPAN_ENTRY_TO_SCAN_NAVIGATION);
        const entryParentSpan = getSpan(CONST.TELEMETRY.SPAN_ENTRY_TO_SCAN);
        if (entryParentSpan) {
            startSpan(CONST.TELEMETRY.SPAN_ENTRY_TO_SCAN_READY, {
                name: CONST.TELEMETRY.SPAN_ENTRY_TO_SCAN_READY,
                op: CONST.TELEMETRY.SPAN_ENTRY_TO_SCAN_READY,
                parentSpan: entryParentSpan,
            });
        }
    }, []);

    // Start camera init span when permission is granted and camera is ready
    useEffect(() => {
        if (cameraInitSpanStarted.current || cameraPermissionStatus !== RESULTS.GRANTED || device == null) {
            return;
        }
        startSpan(CONST.TELEMETRY.SPAN_CAMERA_INIT, {
            name: CONST.TELEMETRY.SPAN_CAMERA_INIT,
            op: CONST.TELEMETRY.SPAN_CAMERA_INIT,
        });
        cameraInitSpanStarted.current = true;
    }, [cameraPermissionStatus, device]);

    // Cancel spans when permission is denied/blocked/unavailable
    useEffect(() => {
        if (cameraPermissionStatus !== RESULTS.BLOCKED && cameraPermissionStatus !== RESULTS.UNAVAILABLE && cameraPermissionStatus !== RESULTS.DENIED) {
            return;
        }
        cancelSpan(CONST.TELEMETRY.SPAN_OPEN_CREATE_EXPENSE);
        cancelSpan(CONST.TELEMETRY.SPAN_ENTRY_TO_SCAN_NAVIGATION);
        cancelSpan(CONST.TELEMETRY.SPAN_ENTRY_TO_SCAN_READY);
        cancelSpan(CONST.TELEMETRY.SPAN_ENTRY_TO_SCAN);
    }, [cameraPermissionStatus]);

    // Cancel spans on unmount if camera never initialized
    useEffect(() => {
        return () => {
            // If camera initialized successfully, spans were already ended
            if (cameraInitialized.current) {
                return;
            }
            // Cancel camera init span if it was started
            if (cameraInitSpanStarted.current) {
                cancelSpan(CONST.TELEMETRY.SPAN_CAMERA_INIT);
            }
            // Always cancel the create expense span if camera never initialized
            cancelSpan(CONST.TELEMETRY.SPAN_OPEN_CREATE_EXPENSE);
            // Cancel entry-to-scan spans if they haven't ended naturally
            cancelSpan(CONST.TELEMETRY.SPAN_ENTRY_TO_SCAN_NAVIGATION);
            cancelSpan(CONST.TELEMETRY.SPAN_ENTRY_TO_SCAN_READY);
            cancelSpan(CONST.TELEMETRY.SPAN_ENTRY_TO_SCAN);
        };
    }, []);

    const handleCameraInitialized = () => {
        // Prevent duplicate span endings if callback fires multiple times
        if (cameraInitialized.current) {
            return;
        }
        cameraInitialized.current = true;
        // Only end camera init span if it was actually started
        if (cameraInitSpanStarted.current) {
            endSpan(CONST.TELEMETRY.SPAN_CAMERA_INIT);
        }
        endSpan(CONST.TELEMETRY.SPAN_OPEN_CREATE_EXPENSE);
        endSpan(CONST.TELEMETRY.SPAN_ENTRY_TO_SCAN_READY);
        endSpan(CONST.TELEMETRY.SPAN_ENTRY_TO_SCAN);

        // Preload the confirmation screen module so its JS is parsed and ready
        // when we navigate after capture — eliminates cold-start module load cost.
        require('@pages/iou/request/step/IOURequestStepConfirmation');

        // Pre-create upload directory to avoid latency during capture
        const path = getReceiptsUploadFolderPath();
        ReactNativeBlobUtil.fs
            .isDir(path)
            .then((isDir) => {
                if (isDir) {
                    return;
                }
                ReactNativeBlobUtil.fs.mkdir(path).catch((error: string) => {
                    Log.warn('Error creating the receipts upload directory', error);
                });
            })
            .catch((error: string) => {
                Log.warn('Error checking if the upload directory exists', error);
            });
    };

    return {handleCameraInitialized};
}

export default useCameraInitTelemetry;
