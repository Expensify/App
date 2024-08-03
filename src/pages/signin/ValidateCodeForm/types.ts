type ValidateCodeFormProps = {
    /** Determines if user is switched to using recovery code instead of 2fa code */
    isUsingRecoveryCode: boolean;

    /** Function to change `isUsingRecoveryCode` state when user toggles between 2fa code and recovery code */
    setIsUsingRecoveryCode: (value: boolean) => void;

    isVisible: boolean;

    /** Function to clear the credentials and partial sign in session so the user can taken back to first Login step */
    setClearSignInData: (clearSignInData: () => void) => void;
};

export default ValidateCodeFormProps;
