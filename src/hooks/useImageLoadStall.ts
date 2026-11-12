import CONST from '@src/CONST';

import {useEffect, useRef, useState} from 'react';

/**
 * Reports an image load whose transport went silent: silence after the first activity is a stall
 * (IMAGE_LOAD_STALL_TIMEOUT); no activity at all gets the ceiling (IMAGE_LOAD_CEILING_TIMEOUT), as
 * platforms without a progress API are indistinguishable from dead ones. reportActivity is stable
 * and moves the timer without re-rendering the caller.
 *
 * The hook keeps all state in refs and creates its functions once, with a lazy state initializer,
 * instead of using useCallback, which React Compiler forbids here. The returned identity must never
 * change, because callers pass it straight to the Image onProgress prop.
 */
function useImageLoadStall(isWatchActive: boolean, onStalled: () => void) {
    const onStalledRef = useRef(onStalled);
    useEffect(() => {
        onStalledRef.current = onStalled;
    });

    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const hasActivityRef = useRef(false);

    // A lazy initializer runs once, on the first render, and React never re-runs it: the pair keeps
    // a stable identity for the lifetime of the component without useCallback.
    const [helpers] = useState(() => {
        const armTimer = () => {
            if (timerRef.current !== null) {
                clearTimeout(timerRef.current);
            }

            const timeout = hasActivityRef.current ? CONST.TIMING.IMAGE_LOAD_STALL_TIMEOUT : CONST.TIMING.IMAGE_LOAD_CEILING_TIMEOUT;
            timerRef.current = setTimeout(() => {
                timerRef.current = null;
                onStalledRef.current();
            }, timeout);
        };

        const reportActivity = () => {
            if (timerRef.current === null) {
                return;
            }
            hasActivityRef.current = true;
            armTimer();
        };

        return {armTimer, reportActivity};
    });

    const {armTimer, reportActivity} = helpers;

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
