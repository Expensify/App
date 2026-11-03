import type {ForwardedRef} from 'react';

type ValidateCodeCountdownHandle = {
    resetCountdown: () => void;
};

type ValidateCodeCountdownProps = {
    onCountdownFinish: () => void;

    /** Epoch-ms time the code was last requested; lets a reload resume the countdown at the correct value instead of restarting it */
    requestedAt?: number;

    ref: ForwardedRef<ValidateCodeCountdownHandle>;
};

export type {ValidateCodeCountdownHandle, ValidateCodeCountdownProps};
