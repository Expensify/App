import useOnyx from '@hooks/useOnyx';

import {getPolicyIDOrDefault} from '@libs/PolicyUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import type {InsightsFilters} from './insightsFilters';

import DEFAULT_INSIGHTS_FILTERS from './insightsFilters';

/** Returns the page-level filters every chart on the dashboard is narrowed by, and whether the Onyx data they are built from has loaded. */
function useInsightsFilters(): {filters: InsightsFilters; isResolved: boolean} {
    const [activePolicyID, activePolicyIDMetadata] = useOnyx(ONYXKEYS.NVP_ACTIVE_POLICY_ID);
    const [activePolicy, activePolicyMetadata] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${getPolicyIDOrDefault(activePolicyID)}`);

    return {
        filters: {...DEFAULT_INSIGHTS_FILTERS, groupCurrency: activePolicy?.outputCurrency ?? CONST.CURRENCY.USD},
        isResolved: activePolicyIDMetadata.status === 'loaded' && activePolicyMetadata.status === 'loaded',
    };
}

export default useInsightsFilters;
