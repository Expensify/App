import React from 'react';
import LocationPermissionModal from '@components/LocationPermissionModal';
import type {ReceiptFile} from '@pages/iou/request/step/IOURequestStepScan/types';
import {updateLastLocationPermissionPrompt} from '@userActions/IOU/MoneyRequest';

type GpsPermissionGateProps = {
    /** Whether the GPS permission flow is active */
    startLocationPermissionFlow: boolean;

    /** Receipt files awaiting confirmation */
    receiptFiles: ReceiptFile[];

    /** Resets the permission flow state */
    resetPermissionFlow: () => void;

    /** Called when GPS permission is granted or denied, with the receipt files and grant status */
    onComplete: (files: ReceiptFile[], locationPermissionGranted: boolean) => void;
};

/**
 * Pure gate component that renders a LocationPermissionModal when GPS permission
 * is needed for distance-based receipt processing.
 */
function GpsPermissionGate({startLocationPermissionFlow, receiptFiles, resetPermissionFlow, onComplete}: GpsPermissionGateProps) {
    if (!startLocationPermissionFlow || !receiptFiles.length) {
        return null;
    }

    return (
        <LocationPermissionModal
            startPermissionFlow={startLocationPermissionFlow}
            resetPermissionFlow={resetPermissionFlow}
            onGrant={() => onComplete(receiptFiles, true)}
            onDeny={() => {
                updateLastLocationPermissionPrompt();
                onComplete(receiptFiles, false);
            }}
        />
    );
}

export default GpsPermissionGate;
