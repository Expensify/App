import React, {useEffect, useImperativeHandle, useRef, useState} from 'react';
import {View} from 'react-native';
import RenderHTML from '@components/RenderHTML';
import useAccessibilityAnnouncement from '@hooks/useAccessibilityAnnouncement';
import useLocalize from '@hooks/useLocalize';
import CONST from '@src/CONST';
import type {ValidateCodeCountdownProps} from './types';

function ValidateCodeCountdown({onCountdownFinish, ref}: ValidateCodeCountdownProps) {
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

    // Announce countdown start/reset for screen readers
    useAccessibilityAnnouncement(translate('validateCodeForm.timeRemainingAnnouncement', {timeRemaining: CONST.REQUEST_CODE_DELAY}), timeRemaining === CONST.REQUEST_CODE_DELAY);

    // Announce expiration for screen readers
    useAccessibilityAnnouncement(translate('validateCodeForm.timeExpiredAnnouncement'), timeRemaining === 0);

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
