import type {ForwardedRef} from 'react';
import type {BaseValidateCodeFormRef} from './BaseValidateCodeForm';

type ValidateCodeFormProps = {
    /** Determines if user is switched to using recovery code instead of 2fa code */
    isUsingRecoveryCode: boolean;

    /** Function to change `isUsingRecoveryCode` state when user toggles between 2fa code and recovery code */
    setIsUsingRecoveryCode: (value: boolean) => void;

    isVisible: boolean;

    /** Reference to the outer element */
    ref: ForwardedRef<BaseValidateCodeFormRef>;
};

export default ValidateCodeFormProps;
