import shouldStartLocationPermissionFlowSelector from '@selectors/LocationPermission';
import LocationPermissionModal from '@components/LocationPermissionModal';
import type {ReceiptFile} from '@pages/iou/request/step/IOURequestStepScan/types';
import {updateLastLocationPermissionPrompt} from '@userActions/IOU';

type GpsLocationGateProps = {
    /** Files awaiting GPS permission resolution. Gate shows modal when non-empty. */
    pendingFiles: ReceiptFile[];

    /** Called when the GPS permission flow is resolved (granted or denied). */
    onResolved: (files: ReceiptFile[], locationPermissionGranted: boolean) => void;
};

/**
 * Declarative GPS permission gate. Renders LocationPermissionModal when
 * pendingFiles is non-empty and a permission prompt is needed.
 *
 * Usage: parent checks `shouldStartLocationPermissionFlow` to decide
 * whether to set pendingFiles (show modal) or call onResolved directly.
 */
function GpsLocationGate({pendingFiles, onResolved}: GpsLocationGateProps) {
    if (pendingFiles.length === 0) {
        return null;
    }

    return (
        <LocationPermissionModal
            startPermissionFlow
            resetPermissionFlow={() => onResolved(pendingFiles, false)}
            onGrant={() => onResolved(pendingFiles, true)}
            onDeny={() => {
                updateLastLocationPermissionPrompt();
                onResolved(pendingFiles, false);
            }}
        />
    );
}

GpsLocationGate.displayName = 'GpsLocationGate';

export default GpsLocationGate;
export {shouldStartLocationPermissionFlowSelector};
