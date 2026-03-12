type DiscardChangesConfirmationProps = {
    /** Checks if there are any unsaved changes */
    getHasUnsavedChanges: () => boolean;

    /** Notifies when the discard modal visibility changes */
    onVisibilityChange?: (isVisible: boolean) => void;

    /** Called when the modal is closed without confirming */
    onCancel?: () => void;

    /** Whether the discard confirmation should be enabled */
    isEnabled?: boolean;
};

export default DiscardChangesConfirmationProps;
