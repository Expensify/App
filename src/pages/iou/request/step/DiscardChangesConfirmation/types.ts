type DiscardChangesConfirmationProps = {
    onCancel?: () => void;
    hasUnsavedChanges: boolean;

    /** When true, listen for browser back on the parent stack navigator instead of the nearest navigator.
     *  Use this when the component is rendered inside a MaterialTopTabNavigator, which doesn't emit transitionStart events. */
    useParentStackForWebBack?: boolean;
};

export default DiscardChangesConfirmationProps;
