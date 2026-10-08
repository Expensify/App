import {savePendingMarketingAttribution} from '@libs/actions/MarketingAttribution';

import ONYXKEYS from '@src/ONYXKEYS';
import {authTokenSelector} from '@src/selectors/Session';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';

import {useEffect} from 'react';

import useOnyx from './useOnyx';

/**
 * Saves the marketing attribution read from the landing URL at startup once the session has loaded,
 * skipping it when the user already has a session.
 */
function useSaveMarketingAttribution() {
    const [authToken, authTokenMetadata] = useOnyx(ONYXKEYS.SESSION, {selector: authTokenSelector});
    const isSessionLoading = isLoadingOnyxValue(authTokenMetadata);

    useEffect(() => {
        if (isSessionLoading) {
            return;
        }
        savePendingMarketingAttribution(!!authToken);
    }, [isSessionLoading, authToken]);
}

export default useSaveMarketingAttribution;
