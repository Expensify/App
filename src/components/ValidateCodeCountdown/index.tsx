import React, {useEffect, useImperativeHandle, useRef, useState} from 'react';
import {AccessibilityInfo, View} from 'react-native';
import RenderHTML from '@components/RenderHTML';
import useLocalize from '@hooks/useLocalize';
import CONST from '@src/CONST';
import type {ValidateCodeCountdownProps} from './types';

function ValidateCodeCountdown({onCountdownFinish, ref}: ValidateCodeCountdownProps) {
    const {translate} = useLocalize();

    const [timeRemaining, setTimeRemaining] = useState<number>(CONST.REQUEST_CODE_DELAY);
    const timerRef = useRef<NodeJS.Timeout | undefined>(undefined);
    const previousTimeRemainingRef = useRef<number>(CONST.REQUEST_CODE_DELAY);

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

    // Announce countdown start/reset and expiration for screen readers (iOS)
    useEffect(() => {
        if (timeRemaining === CONST.REQUEST_CODE_DELAY && previousTimeRemainingRef.current !== CONST.REQUEST_CODE_DELAY) {
            // Countdown was reset
            AccessibilityInfo.announceForAccessibility(translate('validateCodeForm.timeRemainingAnnouncement', {timeRemaining: CONST.REQUEST_CODE_DELAY}));
        } else if (timeRemaining === 0) {
            AccessibilityInfo.announceForAccessibility(translate('validateCodeForm.timeExpiredAnnouncement'));
        }
        previousTimeRemainingRef.current = timeRemaining;
    }, [timeRemaining, translate]);

    // Announce on initial mount
    useEffect(() => {
        AccessibilityInfo.announceForAccessibility(translate('validateCodeForm.timeRemainingAnnouncement', {timeRemaining: CONST.REQUEST_CODE_DELAY}));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <View accessibilityLiveRegion="polite">
            <RenderHTML
                html={translate('validateCodeForm.requestNewCode', {
                    timeRemaining: `00:${String(timeRemaining).padStart(2, '0')}`,
                })}
            />
        </View>
    );
}

export default ValidateCodeCountdown;
