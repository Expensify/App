/** Requests the Details panel's data when it opens, and again when the query changes, the device comes back online, or the expenses change. */
import type {SearchQueryJSON} from '@components/Search/types';

import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';

import {getInsightsBiggestChanges, getInsightsDetails} from '@libs/actions/Insights';
import {search} from '@libs/actions/Search';

import ONYXKEYS from '@src/ONYXKEYS';
import type {InsightsBiggestChangesGroupBy} from '@src/types/onyx';

import {useIsFocused} from '@react-navigation/native';
import {useEffect, useEffectEvent, useRef} from 'react';

import type {InsightsDetailsQuery} from './buildInsightsDetailsQuery';

type BiggestChangesRequest = {
    query: InsightsDetailsQuery;
    groupBy: InsightsBiggestChangesGroupBy;
};

/**
 * Fetches the Details panel's sections and returns a function to fetch them again. Without a Details request, only the Top expenses are fetched, using Search.
 * With `shouldRequestOnEveryReturn`, they're also fetched every time the user returns to the panel.
 * When the Biggest changes grouping changes only that section is fetched again.
 */
function useRequestInsightsDetails(
    query: InsightsDetailsQuery | undefined,
    topExpensesQueryJSON: Readonly<SearchQueryJSON> | undefined,
    shouldRequestOnEveryReturn: boolean,
    biggestChangesRequest?: BiggestChangesRequest,
): () => void {
    const {isOffline} = useNetwork();
    const isFocused = useIsFocused();
    const [spendDataSignature] = useOnyx(ONYXKEYS.DERIVED.SPEND_DATA_SIGNATURE);

    // The grouping the last request covered, so a change to it fetches only Biggest changes
    const lastBiggestChangesGroupByRef = useRef<InsightsBiggestChangesGroupBy | undefined>(undefined);

    const request = () => {
        if (isOffline) {
            return;
        }
        if (query) {
            lastBiggestChangesGroupByRef.current = biggestChangesRequest?.groupBy;
            getInsightsDetails(query.hash, query.jsonQuery, query.topExpensesSnapshotHash);
            return;
        }
        if (topExpensesQueryJSON) {
            search({queryJSON: topExpensesQueryJSON, searchKey: undefined, offset: 0, isLoading: false});
        }
    };

    const onRefreshKeyChange = useEffectEvent(request);

    // An expense edit moves the spend signature and can change the panel's numbers and expenses, so they're fetched again.
    // A change made while an expense is open on top waits until the user is back on the panel.
    const refreshKey = [query?.hash, topExpensesQueryJSON?.hash, isOffline, spendDataSignature?.expenses ?? 0].join('|');
    const lastRefreshKeyRef = useRef<string | undefined>(undefined);
    useEffect(() => {
        if (!isFocused || (!shouldRequestOnEveryReturn && refreshKey === lastRefreshKeyRef.current)) {
            return;
        }
        lastRefreshKeyRef.current = refreshKey;
        onRefreshKeyChange();
    }, [refreshKey, isFocused, shouldRequestOnEveryReturn]);

    const biggestChangesGroupBy = biggestChangesRequest?.groupBy;
    const onBiggestChangesGroupByChange = useEffectEvent(() => {
        if (!biggestChangesRequest || isOffline || lastBiggestChangesGroupByRef.current === undefined) {
            return;
        }
        lastBiggestChangesGroupByRef.current = biggestChangesRequest.groupBy;
        getInsightsBiggestChanges(biggestChangesRequest.query.hash, biggestChangesRequest.query.jsonQuery);
    });
    useEffect(() => {
        if (!isFocused || biggestChangesGroupBy === lastBiggestChangesGroupByRef.current) {
            return;
        }
        onBiggestChangesGroupByChange();
    }, [biggestChangesGroupBy, isFocused]);

    return request;
}

export default useRequestInsightsDetails;
