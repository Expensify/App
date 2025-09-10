import type {ForwardedRef} from 'react';

type BaseTwoFactorAuthFormRef = {
    validateAndSubmitForm: () => void;
    focus: () => void;
};

type TwoFactorAuthFormProps = {
    innerRef: ForwardedRef<BaseTwoFactorAuthFormRef>;
    shouldAutoFocusOnMobile?: boolean;

    // Set this to true in order to call the validateTwoFactorAuth action which is used when setting up 2FA for the first time.
    // Set this to false in order to disable 2FA when a valid code is entered.
    validateInsteadOfDisable?: boolean;

    /** Callback that is called when the text input is focused */
    onFocus?: () => void;
};

export type {TwoFactorAuthFormProps, BaseTwoFactorAuthFormRef};
