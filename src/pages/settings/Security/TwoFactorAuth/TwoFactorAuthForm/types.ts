import type {ForwardedRef} from 'react';
import type {ValueOf} from 'type-fest';
import type CONST from '@src/CONST';

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

    /** The current 2FA step/flow being displayed */
    step?: ValueOf<typeof CONST.TWO_FACTOR_AUTH_STEPS>;
};

export type {TwoFactorAuthFormProps, BaseTwoFactorAuthFormRef};
