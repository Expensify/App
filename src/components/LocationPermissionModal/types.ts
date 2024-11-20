type LocationPermissionModalProps = {
    /** A callback to call when the permission has been granted */
    onGrant: () => void;

    /** A callback to call when the permission has been denied */
    onDeny: () => void;

    /** Should start the permission flow? */
    startPermissionFlow: boolean;

    /** Reset the permission flow */
    resetPermissionFlow: () => void;
};

export default {};

export type {LocationPermissionModalProps};
