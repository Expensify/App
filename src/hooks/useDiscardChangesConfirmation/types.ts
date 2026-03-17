type UseDiscardChangesConfirmationOptions = {
    isEnabled?: boolean;
    hasUnsavedChanges: boolean;
    onVisibilityChange?: (visible: boolean) => void;
    onCancel?: () => void;
    shouldNavigateAfterSave?: boolean;
    navigateBack?: () => void;
};

export default UseDiscardChangesConfirmationOptions;
