import ONYXKEYS from '@src/ONYXKEYS';

import {useEffect, useEffectEvent} from 'react';

import useOnyx from './useOnyx';

/**
 * Defers fetching during Copilot transitions so requests use the active account's token.
 * Changing fetchKey fetches data again; changing only the callback does not.
 */
function useFetchAfterAppLoaded(fetchData: () => void, fetchKey?: string | number): void {
    const [isLoadingApp] = useOnyx(ONYXKEYS.IS_LOADING_APP);
    const fetchDataEvent = useEffectEvent(() => {
        fetchData();
    });

    // Delegate.connect sets IS_LOADING_APP=true in clearOnyxForDelegateTransition and OpenApp's optimisticData.
    // OpenApp's finallyData clears it after NetworkStore.authToken has switched to the delegate.
    useEffect(() => {
        if (isLoadingApp) {
            return;
        }
        fetchDataEvent();
    }, [isLoadingApp, fetchKey]);
}

export default useFetchAfterAppLoaded;
