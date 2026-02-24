type UseDiscardChangesConfirmationOptions = {
    getHasUnsavedChanges: () => boolean;
    onCancel?: () => void;
    isEnabled?: boolean;
};

export default UseDiscardChangesConfirmationOptions;
