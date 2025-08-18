/**
 * If DeleteWorkspace endpoint fails, we show a modal with the error message that BE responds with.
 */
type DeleteWorkspaceErrorModal = {
    /** Whether the modal should be visible */
    isVisible: boolean;

    /** The error message to display in the modal */
    errorMessage: string;
};

export default DeleteWorkspaceErrorModal;
