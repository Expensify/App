type ValidateCodeCountdownProps = {
    shouldDisableResendValidateCode: boolean;
    hasError: boolean;
    isOffline: boolean;
    onResendValidateCode: () => void;
};

type ValidateCodeCountdownHandle = {
    resetCountdown: () => void;
};

export type {ValidateCodeCountdownHandle, ValidateCodeCountdownProps};
