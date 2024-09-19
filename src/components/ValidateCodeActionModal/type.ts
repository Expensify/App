import React from 'react';
import type {Errors, PendingAction} from '@src/types/onyx/OnyxCommon';

type ValidateCodeActionModalProps = {
    /** Whether the modal is visible */
    isVisible: boolean;

    /** Title of the modal */
    title: string;

    /** Description of the modal */
    description: string;

    /** Function to call when the user closes the modal */
    onClose: () => void;

    /** The pending action for submitting form */
    validatePendingAction?: PendingAction | null;

    /** The error of submitting  */
    validateError?: Errors;

    /** Function is called when submitting form  */
    handleSubmitForm: (validateCode: string) => void;

    /** Function to clear error of the form */
    clearError: () => void;

    footer?: React.JSX.Element;

    sendValidateCode: () => void;

    /** If the magic code has been resent previously */
    hasMagicCodeBeenSent?: boolean;
};

// eslint-disable-next-line import/prefer-default-export
export type {ValidateCodeActionModalProps};
