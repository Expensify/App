type ReportVirtualCardFraudConfirmationModalProps = {
    /** Whether the modal is visible */
    isVisible: boolean;

    /** Title of the modal */
    title: string;

    /** Function to call when the user closes the modal */
    onClose?: () => void;

    /** Function to be called when the modal is closed */
    onModalHide?: () => void;
};

// eslint-disable-next-line import/prefer-default-export
export type {ReportVirtualCardFraudConfirmationModalProps};
