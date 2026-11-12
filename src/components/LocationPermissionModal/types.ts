/** At most one of onGrant, onDeny, or resetPermissionFlow fires per permission flow; none fires if the caller aborts the flow or unmounts. */
type LocationPermissionModalProps = {
    /** Called when the permission is granted. */
    onGrant: () => void;

    /** Called when permission is denied. wasUserInitiated is true when the user tapped "Not now" (false when the OS denied it). */
    onDeny: (wasUserInitiated: boolean) => void;

    /** The flow runs while this is true, and switching it to false closes the prompt. */
    startPermissionFlow: boolean;

    /** Called when the flow ends without a decision (e.g. backdrop press or opening OS settings). */
    resetPermissionFlow: () => void;
};

export default LocationPermissionModalProps;
