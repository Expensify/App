type ReportVirtualCardFraudConfirmationModalProps = {
    /** Whether the modal is visible */
    isVisible: boolean;

    /** Title of the modal */
    title: string;

    /** Primary description of the modal */
    descriptionPrimary: string;

    /** Secondary description of the modal */
    descriptionSecondary?: string | null;

    /** Function to call when the user closes the modal */
    onClose?: () => void;

    /** Function to be called when the modal is closed */
    onModalHide?: () => void;
};

// eslint-disable-next-line import/prefer-default-export
export type {ReportVirtualCardFraudConfirmationModalProps};
