import type {ValidateCodeFormHandle} from '@components/ValidateCodeActionModal/ValidateCodeForm/BaseValidateCodeForm';

import type {Errors, PendingAction} from '@src/types/onyx/OnyxCommon';

import type {ForwardedRef, ReactNode} from 'react';
import type {TextStyle} from 'react-native';

type ValidateCodeActionFormProps = {
    /** Primary description of the modal */
    descriptionPrimary: ReactNode;

    descriptionPrimaryStyles?: TextStyle;

    /** Secondary description of the modal */
    descriptionSecondary?: ReactNode;

    descriptionSecondaryStyles?: TextStyle;

    /** The pending action for submitting form */
    validatePendingAction?: PendingAction | null;

    validateError?: Errors;
    handleSubmitForm: (validateCode: string) => void;
    clearError: () => void;

    /** Function is called when validate code modal is mounted and on validateCode resend */
    sendValidateCode: () => void;

    /** If the validateCode has been resent previously */
    hasValidateCodeBeenSent?: boolean;

    isLoading?: boolean;
    shouldShowSkipButton?: boolean;
    handleSkipButtonPress?: () => void;
    submitButtonText?: string;

    /** Skip the call to sendValidateCode fn on initial render */
    shouldSkipInitialValidation?: boolean;

    ref?: ForwardedRef<ValidateCodeFormHandle>;
};

// eslint-disable-next-line import/prefer-default-export
export type {ValidateCodeActionFormProps};
