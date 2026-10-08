import {captureMarketingAttributionFromURL, saveMarketingAttribution} from '@libs/actions/MarketingAttribution';

import ONYXKEYS from '@src/ONYXKEYS';
import {authTokenSelector} from '@src/selectors/Session';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';

import {useEffect, useRef, useState} from 'react';

import useOnyx from './useOnyx';

/**
 * Reads marketing attribution from the landing URL on the first render, and saves it once the session has loaded,
 * skipping it when the user already has a session. Used in Expensify.tsx, which renders before NavigationRoot,
 * so the query string is read before the router can strip it.
 */
function useSaveMarketingAttribution() {
    const [capturedAttribution] = useState(captureMarketingAttributionFromURL);
    const [authToken, authTokenMetadata] = useOnyx(ONYXKEYS.SESSION, {selector: authTokenSelector});
    const isSessionLoading = isLoadingOnyxValue(authTokenMetadata);
    const hasHandledAttribution = useRef(false);

    useEffect(() => {
        if (isSessionLoading || hasHandledAttribution.current) {
            return;
        }
        hasHandledAttribution.current = true;
        saveMarketingAttribution(capturedAttribution, !!authToken);
    }, [isSessionLoading, authToken, capturedAttribution]);
}

export default useSaveMarketingAttribution;
