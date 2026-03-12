type DiscardChangesConfirmationProps = {
    onCancel?: () => void;
    hasUnsavedChanges: boolean;
    shouldNavigateAfterSave?: boolean;
    navigateBack?: () => void;
    /** Notifies when the discard modal visibility changes */
    onVisibilityChange?: (isVisible: boolean) => void;
};

export default DiscardChangesConfirmationProps;
