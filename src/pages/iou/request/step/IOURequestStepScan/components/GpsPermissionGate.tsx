import LocationPermissionModal from '@components/LocationPermissionModal';
import {updateLastLocationPermissionPrompt} from '@userActions/IOU';

type GpsPermissionGateProps = {
    /** Whether the permission prompt is active. */
    active: boolean;

    /** Called when the user grants or denies GPS permission. */
    onResolved: (locationPermissionGranted: boolean) => void;
};

/**
 * Pure GPS permission gate — renders LocationPermissionModal when active.
 * No files, no receipts, no business concepts. Just resolves a boolean.
 */
function GpsPermissionGate({active, onResolved}: GpsPermissionGateProps) {
    if (!active) {
        return null;
    }

    return (
        <LocationPermissionModal
            startPermissionFlow
            resetPermissionFlow={() => onResolved(false)}
            onGrant={() => onResolved(true)}
            onDeny={() => {
                updateLastLocationPermissionPrompt();
                onResolved(false);
            }}
        />
    );
}

GpsPermissionGate.displayName = 'GpsPermissionGate';

export default GpsPermissionGate;
