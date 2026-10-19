import {captureMarketingAttributionFromURL, saveMarketingAttribution} from '@libs/actions/MarketingAttribution';

import ONYXKEYS from '@src/ONYXKEYS';
import {hasNonAnonymousSessionSelector} from '@src/selectors/Session';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';

import {useEffect, useRef, useState} from 'react';

import useOnyx from './useOnyx';

/**
 * Reads marketing attribution from the landing URL on the first render, and saves it once the session has loaded,
 * skipping it when the user is already signed in. Anonymous sessions (used to view public rooms) still save it, since those users
 * can sign up from the room. Used in Expensify.tsx, which renders before NavigationRoot,
 * so the query string is read before the router can strip it.
 */
function useSaveMarketingAttribution() {
    const [capturedAttribution] = useState(captureMarketingAttributionFromURL);
    const [hasNonAnonymousSession, sessionMetadata] = useOnyx(ONYXKEYS.SESSION, {selector: hasNonAnonymousSessionSelector});
    const isSessionLoading = isLoadingOnyxValue(sessionMetadata);
    const hasHandledAttribution = useRef(false);

    useEffect(() => {
        if (isSessionLoading || hasHandledAttribution.current) {
            return;
        }
        hasHandledAttribution.current = true;
        saveMarketingAttribution(capturedAttribution, !!hasNonAnonymousSession);
    }, [isSessionLoading, hasNonAnonymousSession, capturedAttribution]);
}

export default useSaveMarketingAttribution;
