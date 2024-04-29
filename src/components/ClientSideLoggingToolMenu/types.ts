type ClientSideLoggingToolMenuProps = {
    /** Boolean to know if this was opened via test tools modal */
    isViaTestToolsModal: boolean;
    /** Action to close the test tools modal */
    closeTestToolsModal?: () => void;
};

export default ClientSideLoggingToolMenuProps;
