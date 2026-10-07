import CONST from '@src/CONST';

import {useCallback, useEffect, useRef} from 'react';

/**
 * Reports an image load whose transport went silent: silence after the first activity is a stall
 * (IMAGE_LOAD_STALL_TIMEOUT); no activity at all gets the ceiling (IMAGE_LOAD_CEILING_TIMEOUT), as
 * platforms without a progress API are indistinguishable from dead ones. reportActivity is stable
 * and moves the timer without re-rendering the caller.
 */
function useImageLoadStall(isWatchActive: boolean, onStalled: () => void) {
    const onStalledRef = useRef(onStalled);
    useEffect(() => {
        onStalledRef.current = onStalled;
    });

    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const hasActivityRef = useRef(false);

    const armTimer = useCallback(() => {
        if (timerRef.current !== null) {
            clearTimeout(timerRef.current);
        }

        const timeout = hasActivityRef.current ? CONST.TIMING.IMAGE_LOAD_STALL_TIMEOUT : CONST.TIMING.IMAGE_LOAD_CEILING_TIMEOUT;
        timerRef.current = setTimeout(() => {
            timerRef.current = null;
            onStalledRef.current();
        }, timeout);
    }, []);

    const reportActivity = useCallback(() => {
        if (timerRef.current === null) {
            return;
        }
        hasActivityRef.current = true;
        armTimer();
    }, [armTimer]);

    useEffect(() => {
        if (!isWatchActive) {
            return;
        }
        hasActivityRef.current = false;
        armTimer();
        return () => {
            if (timerRef.current === null) {
                return;
            }
            clearTimeout(timerRef.current);
            timerRef.current = null;
        };
    }, [isWatchActive, armTimer]);

    return reportActivity;
}

export default useImageLoadStall;
