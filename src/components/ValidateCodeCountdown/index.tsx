import RenderHTML from '@components/RenderHTML';

import useAccessibilityAnnouncement from '@hooks/useAccessibilityAnnouncement';
import useLocalize from '@hooks/useLocalize';

import DateUtils from '@libs/DateUtils';

import CONST from '@src/CONST';

import React, {useEffect, useImperativeHandle, useRef, useState} from 'react';

import type {ValidateCodeCountdownProps} from './types';

function ValidateCodeCountdown({onCountdownFinish, requestedAt, ref}: ValidateCodeCountdownProps) {
    const {translate} = useLocalize();

    const [startedAt, setStartedAt] = useState(() => Date.now());
    const anchor = requestedAt ?? startedAt;

    // Seeding from the request time lets a reload mid-countdown resume instead of restarting at the full delay.
    const [timeRemaining, setTimeRemaining] = useState<number>(
        () => DateUtils.getRemainingSecondsInWindow(anchor, CONST.REQUEST_CODE_DELAY * CONST.MILLISECONDS_PER_SECOND) || CONST.REQUEST_CODE_DELAY,
    );
    const timerRef = useRef<NodeJS.Timeout | undefined>(undefined);

    useImperativeHandle(ref, () => ({
        resetCountdown: () => {
            setStartedAt(Date.now());
            setTimeRemaining(CONST.REQUEST_CODE_DELAY);
        },
    }));

    useEffect(() => {
        if (timeRemaining <= 0) {
            onCountdownFinish();
            return;
        }

        // Align to the anchor's second boundary so every tab and reload flips the same second at the same instant.
        const msUntilNextTick = CONST.MILLISECONDS_PER_SECOND - ((Date.now() - anchor) % CONST.MILLISECONDS_PER_SECOND);

        timerRef.current = setTimeout(() => {
            // Recompute instead of decrementing: a throttled tab or a suspended app delivers fewer callbacks than seconds.
            setTimeRemaining(DateUtils.getRemainingSecondsInWindow(anchor, CONST.REQUEST_CODE_DELAY * CONST.MILLISECONDS_PER_SECOND));
        }, msUntilNextTick);

        return () => {
            clearTimeout(timerRef.current);
        };
    }, [onCountdownFinish, timeRemaining, anchor]);

    // Announce countdown start/reset/expiration for screen readers.
    // We check timeRemaining === 1 (not 0) because the component unmounts immediately at 0s, so the expired announcement wouldn't be spoken.
    // We use timeRemaining % 10 === 1 to announce every 10 seconds (at 21s, 11s, 1s) to avoid overwhelming screen reader users.
    useAccessibilityAnnouncement(
        timeRemaining === 1 ? translate('validateCodeForm.timeExpiredAnnouncement') : translate('validateCodeForm.timeRemainingAnnouncement', {count: timeRemaining - 1}),
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
