import {buildSearchQueryJSON} from '@libs/SearchQueryUtils';
import {EMPTY_YOUR_SPEND_PATCH_DATA} from '@libs/YourSpendPatchData';
import type {YourSpendPatchData} from '@libs/YourSpendPatchData';
import {buildAwaitingApprovalQuery, buildRepaidLast30DaysQuery, getPaidGroupPolicyIDs, selectPaidGroupPolicies} from '@libs/YourSpendQueryUtils';

import ONYXKEYS from '@src/ONYXKEYS';

import {useMemo} from 'react';

import useCurrentUserPersonalDetails from './useCurrentUserPersonalDetails';
import useOnyx from './useOnyx';

/** Supplies the paid-group policies and "Your spend" snapshot aggregates the offline snapshot-patch builders need. */
function useYourSpendPatchData(): YourSpendPatchData {
    const {accountID} = useCurrentUserPersonalDetails();
    const [paidPolicies] = useOnyx(ONYXKEYS.COLLECTION.POLICY, {selector: selectPaidGroupPolicies});
    const paidGroupPolicyIDs = getPaidGroupPolicyIDs(paidPolicies);

    const approvalHash = buildSearchQueryJSON(buildAwaitingApprovalQuery(accountID, paidGroupPolicyIDs))?.hash;
    const paymentHash = buildSearchQueryJSON(buildRepaidLast30DaysQuery(accountID))?.hash;

    const approvalKey = `${ONYXKEYS.COLLECTION.SNAPSHOT}${approvalHash}` as const;
    const paymentKey = `${ONYXKEYS.COLLECTION.SNAPSHOT}${paymentHash}` as const;

    const [approvalSearch] = useOnyx(approvalKey, {selector: (snapshot) => snapshot?.search});
    const [paymentSearch] = useOnyx(paymentKey, {selector: (snapshot) => snapshot?.search});

    return useMemo(
        (): YourSpendPatchData => ({
            paidPolicies: paidPolicies ?? EMPTY_YOUR_SPEND_PATCH_DATA.paidPolicies,
            snapshotSearches: {
                [approvalKey]: approvalSearch,
                [paymentKey]: paymentSearch,
            },
        }),
        [paidPolicies, approvalKey, approvalSearch, paymentKey, paymentSearch],
    );
}

export default useYourSpendPatchData;
