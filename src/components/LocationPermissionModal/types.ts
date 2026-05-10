type LocationPermissionModalProps = {
    /** A callback to call when the permission has been granted */
    onGrant: () => void;

    /** A callback to call when the permission has been denied. `wasUserInitiated` is true only when the user explicitly pressed "Not now"; it is false when the underlying browser/OS layer denied or blocked the permission without a user-driven decision. */
    onDeny: (wasUserInitiated: boolean) => void;

    /** Should start the permission flow? */
    startPermissionFlow: boolean;

    /** Reset the permission flow */
    resetPermissionFlow: () => void;

    /** A callback to call when the initial get location is completed */
    onInitialGetLocationCompleted?: () => void;
};

export default LocationPermissionModalProps;
