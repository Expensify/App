import React, {useEffect, useImperativeHandle, useRef, useState} from 'react';
import RenderHTML from '@components/RenderHTML';
import useAccessibilityAnnouncement from '@hooks/useAccessibilityAnnouncement';
import useLocalize from '@hooks/useLocalize';
import DateUtils from '@libs/DateUtils';
import CONST from '@src/CONST';
import type {ValidateCodeCountdownProps} from './types';

function ValidateCodeCountdown({onCountdownFinish, requestedAt, ref}: ValidateCodeCountdownProps) {
    const {translate} = useLocalize();

    // Seed from the time the code was actually requested so a reload mid-countdown resumes at the correct value instead of restarting at the full delay.
    const [timeRemaining, setTimeRemaining] = useState<number>(
        () => DateUtils.getRemainingSecondsInWindow(requestedAt, CONST.REQUEST_CODE_DELAY * CONST.MILLISECONDS_PER_SECOND) || CONST.REQUEST_CODE_DELAY,
    );
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

    // Announce countdown start/reset/expiration for screen readers.
    // We check timeRemaining === 1 (not 0) because the component unmounts immediately at 0s, so the expired announcement wouldn't be spoken.
    // We use timeRemaining % 10 === 1 to announce every 10 seconds (at 21s, 11s, 1s) to avoid overwhelming screen reader users.
    useAccessibilityAnnouncement(
        timeRemaining === 1 ? translate('validateCodeForm.timeExpiredAnnouncement') : translate('validateCodeForm.timeRemainingAnnouncement', {timeRemaining: timeRemaining - 1}),
        timeRemaining % 10 === 1,
        {
            shouldAnnounceOnNative: true,
            shouldAnnounceOnWeb: true,
        },
    );

    return (
        <RenderHTML
            html={translate('validateCodeForm.requestNewCode', {
                timeRemaining: `00:${String(timeRemaining).padStart(2, '0')}`,
            })}
        />
    );
}

export default ValidateCodeCountdown;
