type DiscardChangesConfirmationProps = {
    getHasUnsavedChanges: () => boolean;
    onCancel?: () => void;
};

export default DiscardChangesConfirmationProps;
