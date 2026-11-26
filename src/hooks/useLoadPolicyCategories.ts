import {clearPolicyCategoriesLoadingState, getPolicyCategories} from '@libs/actions/Policy/Category';
import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {PolicyCategories} from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';

import {useEffect, useRef} from 'react';

import useCanReadPolicyFeature from './useCanReadPolicyFeature';
import useNetwork from './useNetwork';
import useOnyx from './useOnyx';

const hasPolicyCategoriesSelector = (policyCategories: OnyxEntry<PolicyCategories>) => policyCategories !== undefined;

/**
 * Fetches a policy's categories on demand when a category picker mounts, so a lazy-loaded account does not show only
 * the category already on the expense.
 *
 * The guard is the RAM-only loading state written by `getPolicyCategories`, not "we already tried once": a read that
 * failed leaves `hasOnceLoaded` false, so the next mount or reconnect retries it. Gating on the collection existing
 * would not work either, since a partial collection holding just the selected category is indistinguishable from a
 * complete one. `isLoading` is applied optimistically, so concurrent pickers for the same policy do not each fire a
 * redundant `GetPolicyCategories` read (`API.read` does not dedupe in flight reads).
 *
 * Only roles that can read the workspace's categories send the read, since Auth rejects it for every other role. Those
 * members get the categories with the report through `OpenReport` instead.
 */
function useLoadPolicyCategories(policyID: string | undefined) {
    const [loadingState] = useOnyx(`${ONYXKEYS.COLLECTION.RAM_ONLY_POLICY_CATEGORIES_LOADING_STATE}${getNonEmptyStringOnyxID(policyID)}`);
    const [hasCategories = false] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${getNonEmptyStringOnyxID(policyID)}`, {selector: hasPolicyCategoriesSelector});
    const canReadCategories = useCanReadPolicyFeature(policyID, CONST.POLICY.POLICY_FEATURE.CATEGORIES);
    const isLoading = !!loadingState?.isLoading;
    const hasOnceLoaded = !!loadingState?.hasOnceLoaded;

    // The policyID this instance has already dispatched a read for. A failed read clears `isLoading` without setting
    // `hasOnceLoaded`, which would otherwise re-satisfy the effect's guard and retry in a tight loop. Scoping the
    // attempt to this instance keeps the retry cadence at "next time a picker opens" (or the next reconnect below).
    const requestedPolicyIDRef = useRef<string>(undefined);

    const {isOffline} = useNetwork({
        onReconnect: () => {
            if (!policyID || !canReadCategories || hasOnceLoaded) {
                return;
            }
            // A read cut off by the disconnect never gets a response, so its `failureData` never applies and
            // `isLoading` would stay true for the rest of the session. Clear it so the effect below can retry.
            requestedPolicyIDRef.current = undefined;
            clearPolicyCategoriesLoadingState(policyID);
        },
    });

    useEffect(() => {
        if (isOffline || !policyID || !canReadCategories || isLoading || hasOnceLoaded || requestedPolicyIDRef.current === policyID) {
            return;
        }
        requestedPolicyIDRef.current = policyID;
        getPolicyCategories(policyID);
    }, [policyID, canReadCategories, isOffline, isLoading, hasOnceLoaded]);

    // True only while the read is unsettled and there is nothing to render yet, so the picker shows a skeleton instead
    // of an empty list. The `policyID` and `canReadCategories` checks mirror the effect's guard: when no read is ever
    // dispatched, the absent loading state would otherwise keep the skeleton up forever.
    const isLoadingCompletePolicyCategories = !!policyID && canReadCategories && !isOffline && !hasOnceLoaded && (isLoading || loadingState === undefined);
    const isLoadingPolicyCategories = isLoadingCompletePolicyCategories && !hasCategories;

    return {isLoadingPolicyCategories, isLoadingCompletePolicyCategories};
}

export default useLoadPolicyCategories;
