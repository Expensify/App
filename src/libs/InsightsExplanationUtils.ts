/** Builds cache identities and rejects answers for stale or different Insights contexts. */
import type {InsightsExplanation, InsightsScope} from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';

import DateUtils from './DateUtils';
import {getDBTimeWithSkew} from './NetworkState';

const EXPLANATION_CACHE_LIFETIME_MS = 5 * 60 * 1000;

function buildInsightsExplanationQuery(accountID: number, reportID: string | undefined, explainPrompt: string, insightsScope: InsightsScope): string {
    return JSON.stringify({accountID, reportID, explainPrompt: explainPrompt.trim(), insightsScope: {...insightsScope, policyIDs: insightsScope.policyIDs.toSorted()}});
}

function getCachedInsightsExplanation(explanation: OnyxEntry<InsightsExplanation>, jsonQuery: string): string | undefined {
    const now = getDBTimeWithSkew();
    if (
        explanation?.jsonQuery !== jsonQuery ||
        !explanation.response ||
        !explanation.createdAt ||
        explanation.createdAt > now ||
        explanation.createdAt <= DateUtils.subtractMillisecondsFromDateTime(now, EXPLANATION_CACHE_LIFETIME_MS)
    ) {
        return;
    }
    return explanation.response;
}

export {buildInsightsExplanationQuery, getCachedInsightsExplanation};
