type BackgroundLocationPermissionsFlowCallbacks = {
    /** Called when reading or requesting the permissions threw */
    onError: () => void;

    /** Called when every location permission the platform needs is granted */
    onGrant: () => void;

    /** Called when a permission is denied for good, so the flow can no longer ask for it */
    onDeny: () => void;
};

export default BackgroundLocationPermissionsFlowCallbacks;
