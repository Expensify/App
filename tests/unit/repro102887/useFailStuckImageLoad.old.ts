import CONST from '@src/CONST';

import {useEffect, useEffectEvent} from 'react';

/**
 * An image is not guaranteed to ever emit onLoad/onError, so this treats a spinner that outlives
 * ACTIVITY_INDICATOR_TIMEOUT as a load failure and calls `onFail`.
 *
 * @param shouldFailAfterTimeout - Whether the loading spinner is showing and may be failed (callers exclude offline).
 * @param onFail - The component's existing error handler.
 */
function useFailStuckImageLoad(shouldFailAfterTimeout: boolean, onFail: () => void) {
    const failStuckLoad = useEffectEvent(onFail);

    useEffect(() => {
        if (!shouldFailAfterTimeout) {
            return;
        }
        const timeout = setTimeout(failStuckLoad, CONST.TIMING.ACTIVITY_INDICATOR_TIMEOUT);
        return () => clearTimeout(timeout);
    }, [shouldFailAfterTimeout]);
}

export default useFailStuckImageLoad;
