type UseDiscardChangesConfirmationOptions = {
    getHasUnsavedChanges: () => boolean;
    shouldInterceptHardwareBack?: boolean;
    onCancel?: () => void;
    onVisibilityChange?: (visible: boolean) => void;
    onConfirm?: () => void | Promise<void>;
};

export default UseDiscardChangesConfirmationOptions;
