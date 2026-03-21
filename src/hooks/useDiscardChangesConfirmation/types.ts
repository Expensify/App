type UseDiscardChangesConfirmationOptions = {
    getHasUnsavedChanges: () => boolean;
    onCancel?: () => void;
    onVisibilityChange?: (visible: boolean) => void;
    isEnabled?: boolean;
};

export default UseDiscardChangesConfirmationOptions;
