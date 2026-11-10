import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';

import {getInsightsDetails} from '@libs/actions/Insights';

import ONYXKEYS from '@src/ONYXKEYS';
import type {InsightsDetailsSummary} from '@src/types/onyx';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

import {useEffect, useEffectEvent} from 'react';

import type {InsightsDetailsQuery} from './buildInsightsDetailsQuery';
import type {InsightsDetailsSectionState} from './insightsDetailsSectionState';

import {getInsightsDetailsSectionState} from './insightsDetailsSectionState';

type InsightsSummary = {
    summary: InsightsDetailsSummary | undefined;
    state: InsightsDetailsSectionState;
    retry: () => void;
};

/** Requests the Details panel's summary and returns it with the state the section is in. */
function useInsightsSummary(query: InsightsDetailsQuery | undefined): InsightsSummary {
    const {isOffline} = useNetwork();
    const [details] = useOnyx(`${ONYXKEYS.COLLECTION.INSIGHTS_DETAILS}${query?.hash}`);

    const retry = () => {
        if (!query || isOffline) {
            return;
        }
        getInsightsDetails(query.hash, query.jsonQuery);
    };

    const onQueryOrNetworkChange = useEffectEvent(retry);

    useEffect(() => {
        onQueryOrNetworkChange();
    }, [query?.hash, isOffline]);

    const summary = details?.summary;
    const state = getInsightsDetailsSectionState({
        isOffline,
        isLoaded: !!summary,
        hasErrors: !isEmptyObject(details?.errors),
        responseJsonCode: details?.responseJsonCode,
    });

    return {summary, state, retry};
}

export default useInsightsSummary;
