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
    const pendingRequest = useRef<{jsonQuery: string; response: Promise<string | undefined>} | undefined>(undefined);
    const pendingClick = useRef<((answer: string | undefined) => void) | undefined>(undefined);

    const requestExplanation = () => {
        if (pendingRequest.current?.jsonQuery === jsonQuery) {
            return pendingRequest.current.response;
        }
        lastRequestedQuery.current = jsonQuery;
        const response = preloadInsightsExplanation(jsonQuery, hash);
        pendingRequest.current = {jsonQuery, response};
        response.finally(() => {
            if (pendingRequest.current?.response !== response) {
                return;
            }
            pendingRequest.current = undefined;
        });
        return response;
    };

    useEffect(() => {
        if (isOffline) {
            lastRequestedQuery.current = undefined;
            // A click already waiting for generation must still reach the queued-comment flow if connectivity drops.
            pendingClick.current?.(undefined);
            pendingClick.current = undefined;
            return;
        }
        if (!shouldPreload || !accountID || !reportID || !explainPrompt.trim()) {
            return;
        }
        const remainingTime = getInsightsExplanationRemainingTime(explanation, jsonQuery);
        if (remainingTime > 0) {
            // A successful answer can refresh once it expires; a failed request still falls back to the live flow.
            lastRequestedQuery.current = undefined;
            const timeout = setTimeout(() => {
                requestExplanation();
            }, remainingTime);
            return () => clearTimeout(timeout);
        }
        if (lastRequestedQuery.current === jsonQuery) {
            return;
        }
        requestExplanation();
    }, [isOffline, shouldPreload, accountID, reportID, explainPrompt, jsonQuery, hash, explanation, requestExplanation]);

    // An early click joins the preload. A failed preload gets one new attempt before the caller uses the live flow.
    return () => {
        const cached = getCachedInsightsExplanation(explanation, jsonQuery);
        if (cached || isOffline || !shouldPreload || !accountID || !reportID) {
            return cached;
        }
        return new Promise<string | undefined>((resolve) => {
            pendingClick.current = resolve;
            requestExplanation().then((answer) => {
                if (pendingClick.current !== resolve) {
                    return;
                }
                pendingClick.current = undefined;
                resolve(answer);
            });
        });
    };
}

export default useInsightsExplanation;
