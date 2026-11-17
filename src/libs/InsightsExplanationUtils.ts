/** Builds cache identities and rejects answers for stale or different Insights contexts. */
import type {InsightsExplanation, InsightsScope} from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';

import {toDate} from 'date-fns-tz';

import {getServerAnchoredDBTime} from './NetworkState';

const EXPLANATION_CACHE_LIFETIME_MS = 5 * 60 * 1000;

function buildInsightsExplanationQuery(accountID: number, reportID: string | undefined, explainPrompt: string, insightsScope: InsightsScope): string {
    return JSON.stringify({accountID, reportID, explainPrompt: explainPrompt.trim(), insightsScope: {...insightsScope, policyIDs: insightsScope.policyIDs.toSorted()}});
}

/** Remaining cache lifetime in milliseconds, or zero when the answer cannot be reused. */
function getInsightsExplanationRemainingTime(explanation: OnyxEntry<InsightsExplanation>, jsonQuery: string): number {
    const now = getServerAnchoredDBTime();
    if (explanation?.jsonQuery !== jsonQuery || !explanation.response || !explanation.createdAt || explanation.createdAt > now) {
        return 0;
    }
    const ageMS = toDate(now, {timeZone: 'UTC'}).valueOf() - toDate(explanation.createdAt, {timeZone: 'UTC'}).valueOf();
    return Number.isFinite(ageMS) ? Math.max(0, EXPLANATION_CACHE_LIFETIME_MS - ageMS) : 0;
}

function getCachedInsightsExplanation(explanation: OnyxEntry<InsightsExplanation>, jsonQuery: string): string | undefined {
    return getInsightsExplanationRemainingTime(explanation, jsonQuery) > 0 ? explanation?.response : undefined;
}

export {buildInsightsExplanationQuery, getCachedInsightsExplanation, getInsightsExplanationRemainingTime};
