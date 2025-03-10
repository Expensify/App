import type {ForwardedRef} from 'react';
import type {ValidateCodeFormHandle} from '@components/ValidateCodeActionModal/ValidateCodeForm/BaseValidateCodeForm';
import type {Errors, PendingAction} from '@src/types/onyx/OnyxCommon';

type ValidateCodeActionFormProps = {
    /** Primary description of the modal */
    descriptionPrimary: string;

    /** Secondary description of the modal */
    descriptionSecondary?: string | null;

    /** The pending action for submitting form */
    validatePendingAction?: PendingAction | null;

    /** The error of submitting  */
    validateError?: Errors;

    /** Function is called when submitting form  */
    handleSubmitForm: (validateCode: string) => void;

    /** Function to clear error of the form */
    clearError: () => void;

    /** Function is called when validate code modal is mounted and on magic code resend */
    sendValidateCode: () => void;

    /** If the magic code has been resent previously */
    hasMagicCodeBeenSent?: boolean;

    /** Whether the form is loading or not */
    isLoading?: boolean;

    /** Ref for validate code form */
    forwardedRef: ForwardedRef<ValidateCodeFormHandle>;
};

// eslint-disable-next-line import/prefer-default-export
export type {ValidateCodeActionFormProps};
