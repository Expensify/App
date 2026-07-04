import type {TranslationPaths} from '@src/languages/types';

import type {Ref} from 'react';
import type {StyleProp, TextStyle} from 'react-native';

type BaseTwoFactorAuthFormRef = {
    validateAndSubmitForm: () => void;
    focus: () => void;
    focusLastSelected: () => void;
};

type TwoFactorAuthFormProps = {
    /** Whether to allow using a recovery code */
    shouldAllowRecoveryCode?: boolean;

    /** Translation key for the description rendered when the user is entering a TOTP. Defaults to the disable-2FA prose. */
    descriptionKey?: TranslationPaths;

    /** Translation key for the description rendered when the user has switched to entering a recovery code. Defaults to the disable-2FA prose. */
    descriptionKeyWithRecovery?: TranslationPaths;

    /** Style applied to the description text. Callers that render the description outside of a form-only page (e.g. the replace-device flow) pass the same textLabel style the page used to render inline. */
    descriptionStyle?: StyleProp<TextStyle>;

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
