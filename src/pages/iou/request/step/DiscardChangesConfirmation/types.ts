type DiscardChangesConfirmationProps = {
    onCancel?: () => void;
    hasUnsavedChanges: boolean;
    shouldNavigateAfterSave?: boolean;
    navigateBack?: () => void;
};

export default DiscardChangesConfirmationProps;
