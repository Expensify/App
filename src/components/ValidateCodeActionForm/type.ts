import type {ForwardedRef, ReactNode} from 'react';
import type {TextStyle} from 'react-native';
import type {ValidateCodeFormHandle} from '@components/ValidateCodeActionModal/ValidateCodeForm/BaseValidateCodeForm';
import type {Errors, PendingAction} from '@src/types/onyx/OnyxCommon';

type ValidateCodeActionFormProps = {
    /** Primary description of the modal */
    descriptionPrimary: ReactNode;

    /** Primary description styles */
    descriptionPrimaryStyles?: TextStyle;

    /** Secondary description of the modal */
    descriptionSecondary?: ReactNode;

    /** Secondary description styles */
    descriptionSecondaryStyles?: TextStyle;

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

    /** Whether to show the skip button */
    shouldShowSkipButton?: boolean;

    /** Function to call when the skip button is pressed */
    handleSkipButtonPress?: () => void;

    /** Text for submit button */
    submitButtonText?: string;

    /** Skip the call to sendValidateCode fn on initial render */
    shouldSkipInitialValidation?: boolean;

    /** Ref for validate code form */
    ref?: ForwardedRef<ValidateCodeFormHandle>;
};

// eslint-disable-next-line import/prefer-default-export
export type {ValidateCodeActionFormProps};
