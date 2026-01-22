// eslint-disable-next-line no-restricted-imports
import React, {forwardRef, useEffect, useImperativeHandle, useRef, useState} from 'react';
import RenderHTML from '@components/RenderHTML';
import useLocalize from '@hooks/useLocalize';
import CONST from '@src/CONST';
import type {ValidateCodeCountdownHandle, ValidateCodeCountdownProps} from './types';

function ValidateCodeCountdown({onCountdownFinish}: ValidateCodeCountdownProps, ref: React.ForwardedRef<ValidateCodeCountdownHandle>) {
    const {translate} = useLocalize();

    const [timeRemaining, setTimeRemaining] = useState<number>(CONST.REQUEST_CODE_DELAY);
    const timerRef = useRef<NodeJS.Timeout | undefined>(undefined);

    useImperativeHandle(ref, () => ({
        resetCountdown: () => setTimeRemaining(CONST.REQUEST_CODE_DELAY),
    }));

    useEffect(() => {
        if (timeRemaining > 0) {
            timerRef.current = setTimeout(() => {
                setTimeRemaining((prev) => prev - 1);
            }, 1000);
        } else {
            onCountdownFinish();
        }
        return () => {
            clearTimeout(timerRef.current);
        };
    }, [onCountdownFinish, timeRemaining]);

    return (
        <RenderHTML
            html={translate('validateCodeForm.requestNewCode', {
                timeRemaining: `00:${String(timeRemaining).padStart(2, '0')}`,
            })}
        />
    );
}

export default forwardRef(ValidateCodeCountdown);
