type ValidateCodeActionModalProps = {
    /** Whether the modal is visible */
    isVisible: boolean;

    /** title of the modal */
    title: string;

    /** description of the modal */
    description: string;

    /** Function to call when the user closes the modal */
    onClose: () => void;
};

// eslint-disable-next-line import/prefer-default-export
export type {ValidateCodeActionModalProps};
