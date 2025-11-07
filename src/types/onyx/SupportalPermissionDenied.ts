/**
 * Payload stored under ONYXKEYS.SUPPORTAL_PERMISSION_DENIED when a support token
 * attempts an unauthorized command. Used to trigger a global modal.
 */
type SupportalPermissionDenied = {
    /** API command that was blocked */
    command: string;
};

export default SupportalPermissionDenied;
