import Log from '@libs/Log';

import ONYXKEYS from '@src/ONYXKEYS';

import {useEffect, useRef} from 'react';

import {useIsAppLoadPending} from './useInFlightRequests';
import useNetwork from './useNetwork';
import useOnyx from './useOnyx';

/**
 * Diagnostic only, does not affect rendering.
 *
 * A safety net for the migration off the stored `IS_LOADING_APP` flag to the request-queue truth
 * (`useIsAppLoadPending`). It reads both and logs whenever they disagree, so we can prove in production that
 * the queue truth matches the old flag before any PR deletes the flag. Logs once per disagreement transition
 * (not every render) so a persistent mismatch is a single line, not a flood.
 */
function useIsLoadingAppShadowLog() {
    const [isLoadingApp] = useOnyx(ONYXKEYS.IS_LOADING_APP);
    const isAppLoadPending = useIsAppLoadPending();
    const {isOffline} = useNetwork();

    const hasLoggedDisagreementRef = useRef(false);
    useEffect(() => {
        const disagrees = !!isLoadingApp !== isAppLoadPending;
        if (!disagrees) {
            hasLoggedDisagreementRef.current = false;
            return;
        }
        if (hasLoggedDisagreementRef.current) {
            return;
        }
        hasLoggedDisagreementRef.current = true;
        Log.info('[InFlightRequests] IS_LOADING_APP disagrees with queue truth', false, {
            storedIsLoadingApp: isLoadingApp,
            queueIsAppLoadPending: isAppLoadPending,
            isOffline,
        });
    }, [isLoadingApp, isAppLoadPending, isOffline]);
}

export default useIsLoadingAppShadowLog;
