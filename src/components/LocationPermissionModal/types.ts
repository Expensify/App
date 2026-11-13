/** At most one of onGrant, onDeny, or resetPermissionFlow fires per permission flow; none fires if the caller aborts the flow or unmounts. */
type LocationPermissionModalProps = {
    /** Called when the permission is granted. Never fired together with onDeny or resetPermissionFlow. */
    onGrant: () => void;

    /**
     * Called when the permission is not granted after the user made a decision or the OS denied it.
     * `wasUserInitiated` is true when the user declined the prompt (e.g. "Not now") rather than the OS rejecting the permission.
     * Never fired together with onGrant or resetPermissionFlow.
     */
    onDeny: (wasUserInitiated: boolean) => void;

    /** Starts the permission flow when it becomes true. It runs once for each change of this value. */
    startPermissionFlow: boolean;

    /** Called when the flow ends without a decision (e.g. backdrop press or opening OS settings). Never fired together with onGrant or onDeny. */
    resetPermissionFlow: () => void;
};

export default LocationPermissionModalProps;
