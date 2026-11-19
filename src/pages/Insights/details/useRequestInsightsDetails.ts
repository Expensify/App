import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';

import {getInsightsDetails} from '@libs/actions/Insights';

import ONYXKEYS from '@src/ONYXKEYS';

import {useIsFocused} from '@react-navigation/native';
import {useEffect, useEffectEvent, useRef} from 'react';

import type {InsightsDetailsQuery} from './buildInsightsDetailsQuery';

/** Requests the Details panel's sections and returns a function that requests them again. */
function useRequestInsightsDetails(query: InsightsDetailsQuery | undefined): () => void {
    const {isOffline} = useNetwork();
    const isFocused = useIsFocused();
    const [spendDataSignature] = useOnyx(ONYXKEYS.DERIVED.SPEND_DATA_SIGNATURE);

    const request = () => {
        if (!query || isOffline) {
            return;
        }
        getInsightsDetails(query.hash, query.jsonQuery, query.topExpensesSnapshotHash);
    };

    const onRefreshKeyChange = useEffectEvent(request);

    // An expense edit moves the spend signature and can change the panel's numbers and expenses, so they're fetched again.
    // A change made while an expense is open on top waits until the user is back on the panel.
    const refreshKey = [query?.hash, query?.topExpensesSnapshotHash, isOffline, spendDataSignature?.expenses ?? 0].join('|');
    const lastRefreshKeyRef = useRef<string | undefined>(undefined);
    useEffect(() => {
        if (!isFocused || refreshKey === lastRefreshKeyRef.current) {
            return;
        }
        lastRefreshKeyRef.current = refreshKey;
        onRefreshKeyChange();
    }, [refreshKey, isFocused]);

    return request;
}

export default useRequestInsightsDetails;
