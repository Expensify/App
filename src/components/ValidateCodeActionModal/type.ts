import type React from 'react';
import type {Errors, PendingAction} from '@src/types/onyx/OnyxCommon';

type ValidateCodeActionModalProps = {
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

    /** The pending action for submitting form */
    validatePendingAction?: PendingAction | null;

    /** The error of submitting  */
    validateError?: Errors;

    /** Function is called when submitting form  */
    handleSubmitForm: (validateCode: string) => void;

    /** Function to clear error of the form */
    clearError: () => void;

    /** A component to be rendered inside the modal */
    footer?: () => React.JSX.Element;

    /** Function is called when validate code modal is mounted and on magic code resend */
    sendValidateCode: () => void;

    /** If the magic code has been resent previously */
    hasMagicCodeBeenSent?: boolean;

    /** Whether the form is loading or not */
    isLoading?: boolean;

    /** Whether handle navigation back when modal show. */
    shouldHandleNavigationBack?: boolean;
};

// eslint-disable-next-line import/prefer-default-export
export type {ValidateCodeActionModalProps};
