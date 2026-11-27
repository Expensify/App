/** Returns what Biggest changes groups by and the groupings the user can pick, from the saved choice and the workspaces in scope. */
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useOnyx from '@hooks/useOnyx';

import {getPoliciesInScope} from '@pages/Insights/dashboardSpecs';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {InsightsBiggestChangesGroupBy} from '@src/types/onyx';

import getBiggestChangesGroupByOptions from './getBiggestChangesGroupByOptions';

type BiggestChangesGroupBy = {
    groupBy: InsightsBiggestChangesGroupBy;
    options: InsightsBiggestChangesGroupBy[];
};

function useBiggestChangesGroupBy(policyIDs: string[]): BiggestChangesGroupBy {
    const [savedGroupBy] = useOnyx(ONYXKEYS.NVP_INSIGHTS_BIGGEST_CHANGES_GROUP_BY);
    const [policies] = useOnyx(ONYXKEYS.COLLECTION.POLICY);
    const {login} = useCurrentUserPersonalDetails();
    const options = getBiggestChangesGroupByOptions(getPoliciesInScope(policies, policyIDs), login);

    const groupBy = savedGroupBy && options.includes(savedGroupBy) ? savedGroupBy : CONST.SEARCH.GROUP_BY.CATEGORY;
    return {groupBy, options};
}

export default useBiggestChangesGroupBy;
