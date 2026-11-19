import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';

import ONYXKEYS from '@src/ONYXKEYS';
import type {InsightsDetailsSummary} from '@src/types/onyx';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

import type {InsightsDetailsQuery} from './buildInsightsDetailsQuery';
import type {InsightsDetailsSectionState} from './insightsDetailsSectionState';

import {getInsightsDetailsSectionState} from './insightsDetailsSectionState';

type InsightsSummary = {
    summary: InsightsDetailsSummary | undefined;
    state: InsightsDetailsSectionState;
};

/** Returns the Details panel's stored summary with the state the section is in. */
function useInsightsSummary(query: InsightsDetailsQuery | undefined): InsightsSummary {
    const {isOffline} = useNetwork();
    const [details] = useOnyx(`${ONYXKEYS.COLLECTION.INSIGHTS_DETAILS}${query?.hash}`);

    const summary = details?.summary;
    const state = getInsightsDetailsSectionState({
        isOffline,
        isLoaded: !!summary,
        hasErrors: !isEmptyObject(details?.errors),
        responseJsonCode: details?.responseJsonCode,
    });

    return {summary, state};
}

export default useInsightsSummary;
