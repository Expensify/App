/** Preloads an answer without creating a Concierge conversation or opening the side panel. */
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';

import {buildInsightsExplanationQuery, getCachedInsightsExplanation} from '@libs/InsightsExplanationUtils';
import {hashText} from '@libs/UserUtils';

import {preloadInsightsExplanation} from '@userActions/Insights';

import ONYXKEYS from '@src/ONYXKEYS';
import type {InsightsScope} from '@src/types/onyx';

import {useEffect, useRef} from 'react';

function useInsightsExplanation(explainPrompt: string, insightsScope: InsightsScope, reportID: string | undefined, shouldPreload: boolean) {
    const {accountID} = useCurrentUserPersonalDetails();
    const {isOffline} = useNetwork();
    const jsonQuery = buildInsightsExplanationQuery(accountID, reportID, explainPrompt, insightsScope);
    const hash = hashText(jsonQuery, 2 ** 32);
    const [explanation] = useOnyx(`${ONYXKEYS.COLLECTION.INSIGHTS_EXPLANATION}${hash}`);
    const lastRequestedQuery = useRef<string | undefined>(undefined);

    useEffect(() => {
        if (isOffline) {
            lastRequestedQuery.current = undefined;
            return;
        }
        if (!shouldPreload || !accountID || !reportID || !explainPrompt.trim() || lastRequestedQuery.current === jsonQuery || getCachedInsightsExplanation(explanation, jsonQuery)) {
            return;
        }
        lastRequestedQuery.current = jsonQuery;
        preloadInsightsExplanation(jsonQuery, hash);
    }, [isOffline, shouldPreload, accountID, reportID, explainPrompt, jsonQuery, hash, explanation]);

    // Check freshness at the click as well, since the page may stay mounted longer than the cache lifetime.
    return () => getCachedInsightsExplanation(explanation, jsonQuery);
}

export default useInsightsExplanation;
