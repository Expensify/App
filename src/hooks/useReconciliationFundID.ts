import {useRoute} from '@react-navigation/native';

import useReconciliationCardFeeds from './useReconciliationCardFeeds';

/**
 * The card feed whose Continuous Reconciliation settings the reconciliation pages are configuring.
 *
 * The feed is carried in the route rather than in the last-selected-feed NVP the Expensify Card pages use: that NVP
 * also drives which feed a new card is issued on, so reusing it here would let choosing a feed to reconcile silently
 * retarget card issuance. Reconciliation only reads settings, so its selection stays local to these pages and resets to
 * the default feed on the next visit.
 */
function useReconciliationFundID(policyID: string | undefined): {fundID: number; candidates: ReturnType<typeof useReconciliationCardFeeds>['candidates']} {
    const {candidates, defaultFundID} = useReconciliationCardFeeds(policyID);
    const route = useRoute<{key: string; name: string; params?: {fundID?: string}}>();
    const fundIDFromRoute = Number(route.params?.fundID);

    // Ignore a fund that is not one of this policy's candidates, so a stale or hand-edited URL cannot point the page at
    // a feed the admin cannot configure.
    const isFundIDValid = !Number.isNaN(fundIDFromRoute) && candidates.some((entry) => entry.fundID === fundIDFromRoute);

    return {fundID: isFundIDValid ? fundIDFromRoute : defaultFundID, candidates};
}

export default useReconciliationFundID;
