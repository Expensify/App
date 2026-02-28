type DiscardChangesConfirmationProps = {
    getHasUnsavedChanges: () => boolean;
    onCancel?: () => void;
    isEnabled?: boolean;
};

export default DiscardChangesConfirmationProps;
