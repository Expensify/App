/** Preloads an answer without creating a Concierge conversation or opening the side panel. */
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';

import {buildInsightsExplanationQuery, getCachedInsightsExplanation, getInsightsExplanationRemainingTime} from '@libs/InsightsExplanationUtils';
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
        if (!shouldPreload || !accountID || !reportID || !explainPrompt.trim()) {
            return;
        }
        const requestExplanation = () => {
            lastRequestedQuery.current = jsonQuery;
            preloadInsightsExplanation(jsonQuery, hash);
        };
        const remainingTime = getInsightsExplanationRemainingTime(explanation, jsonQuery);
        if (remainingTime > 0) {
            // A successful answer can refresh once it expires; a failed request still falls back to the live flow.
            lastRequestedQuery.current = undefined;
            const timeout = setTimeout(requestExplanation, remainingTime);
            return () => clearTimeout(timeout);
        }
        if (lastRequestedQuery.current === jsonQuery) {
            return;
        }
        requestExplanation();
    }, [isOffline, shouldPreload, accountID, reportID, explainPrompt, jsonQuery, hash, explanation]);

    // Check freshness at the click as well, since the page may stay mounted longer than the cache lifetime.
    return () => getCachedInsightsExplanation(explanation, jsonQuery);
}

export default useInsightsExplanation;
