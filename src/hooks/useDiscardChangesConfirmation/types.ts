type UseDiscardChangesConfirmationOptions = {
    getHasUnsavedChanges: () => boolean;
    onCancel?: () => void;
    onVisibilityChange?: (visible: boolean) => void;
    onConfirm?: () => void;
};

export default UseDiscardChangesConfirmationOptions;
