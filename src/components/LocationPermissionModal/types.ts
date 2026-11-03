type LocationPermissionModalProps = {
    /** A callback to call when the permission has been granted */
    onGrant: () => void;

    /** A callback to call when the permission has been denied */
    onDeny: (wasUserInitiated: boolean) => void;

    startPermissionFlow: boolean;
    resetPermissionFlow: () => void;
    onInitialGetLocationCompleted?: () => void;
};

export default LocationPermissionModalProps;
