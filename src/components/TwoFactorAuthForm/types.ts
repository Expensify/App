import type {Ref} from 'react';

type BaseTwoFactorAuthFormRef = {
    validateAndSubmitForm: () => void;
    focus: () => void;
    focusLastSelected: () => void;
};

type TwoFactorAuthFormProps = {
    /** Whether to allow using a recovery code */
    shouldAllowRecoveryCode?: boolean;

    /** Callback to call when the form is submitted with a valid code */
    onSubmit: (code: string) => void;

    /** Callback called when text changes in either input */
    onInputChange?: () => void;

    /** External error message to display */
    errorMessage?: string;

    /** Whether to auto-focus the input (logic differs for mobile) */
    shouldAutoFocus?: boolean;

    /** Callback that is called when the text input is focused */
    onFocus?: () => void;

    /** Reference to the outer element */
    ref: Ref<BaseTwoFactorAuthFormRef>;
};

export type {TwoFactorAuthFormProps, BaseTwoFactorAuthFormRef};
