import type {ForwardedRef} from 'react';

type ValidateCodeCountdownHandle = {
    resetCountdown: () => void;
};

type ValidateCodeCountdownProps = {
    onCountdownFinish: () => void;
    ref: ForwardedRef<ValidateCodeCountdownHandle>;
};

export type {ValidateCodeCountdownHandle, ValidateCodeCountdownProps};
