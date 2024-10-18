type ValidateCodeFormProps = {
    /** Determines if user is switched to using recovery code instead of 2fa code */
    isUsingRecoveryCode: boolean;

    /** Function to change `isUsingRecoveryCode` state when user toggles between 2fa code and recovery code */
    setIsUsingRecoveryCode: (value: boolean) => void;

    isVisible: boolean;

    useOnboardingPrivateDomainSettings?: boolean;
};

export default ValidateCodeFormProps;
