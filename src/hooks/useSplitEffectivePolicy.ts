import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';
import {useSearchResultsContext} from '@components/Search/SearchContext';
import getPolicyFromSearchData from '@libs/getPolicyFromSearchData';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy, Report, Transaction} from '@src/types/onyx';
import useOnyx from './useOnyx';
import usePolicy from './usePolicy';
import usePolicyForMovingExpenses from './usePolicyForMovingExpenses';

/**
 * Finds the workspace policy that owns the transaction's custom unit — first by `customUnitID`, then by
 * `customUnitRateID`. This is the single source of truth shared by `useSplitEffectivePolicy`, where it
 * runs as an Onyx selector so the hook only re-renders when the matched policy changes (instead of on
 * every update to the whole policy collection), and by the action layer (`useDeleteTransactions`) where
 * hooks can't be called. Keeping one implementation prevents drift: if the initial split and a later
 * mutation resolved different policies, they'd build distance splits against different mileage rates.
 *
 * Returns `undefined` for the P2P rate: `getRateForP2P` derives the rate from the policy's output
 * currency, so matching a workspace here would ignore the transaction's saved `defaultP2PRate` and
 * compute the wrong rate. P2P expenses have no workspace policy anyway.
 *
 * Reads `customUnit` from `draftTransaction` first (the in-progress split draft), falling back to
 * `transaction` when the draft doesn't carry one yet (e.g. optimistic transaction before the server
 * response, or screens where the draft only holds a split list).
 */
function findSplitPolicyForCustomUnit(allPolicies: OnyxCollection<Policy>, transaction: OnyxEntry<Transaction>, draftTransaction?: OnyxEntry<Transaction>): OnyxEntry<Policy> {
    const customUnitID = draftTransaction?.comment?.customUnit?.customUnitID ?? transaction?.comment?.customUnit?.customUnitID;
    const customUnitRateID = draftTransaction?.comment?.customUnit?.customUnitRateID ?? transaction?.comment?.customUnit?.customUnitRateID;
    if (customUnitRateID === CONST.CUSTOM_UNITS.FAKE_P2P_ID) {
        return undefined;
    }

    const policyByCustomUnitID = customUnitID ? (Object.values(allPolicies ?? {}).find((p) => p?.customUnits?.[customUnitID]) ?? undefined) : undefined;
    if (policyByCustomUnitID) {
        return policyByCustomUnitID;
    }

    return customUnitRateID ? (Object.values(allPolicies ?? {}).find((p) => Object.values(p?.customUnits ?? {}).some((unit) => !!unit.rates?.[customUnitRateID])) ?? undefined) : undefined;
}

/**
 * Pure resolver for the workspace policy used across the split flow. Shared by `useSplitEffectivePolicy`
 * (the hook used on the split pages) and by the action layer (`initSplitExpense` / `useDeleteTransactions`).
 *
 * Resolution order:
 * 1. `currentPolicy` — the report's policy, when provided by the caller.
 * 2. `policyForCustomUnit` — the policy that owns the transaction's custom unit / rate, pre-resolved by
 *    the caller via {@link findSplitPolicyForCustomUnit}.
 * 3. `fallbackPolicy` — the user's active workspace for moving expenses. Needed for self-DM splits,
 *    which have no workspace-bound report/customUnit but still need a policy to resolve categories/tags.
 *    Skipped for the P2P rate, which has no workspace policy and must keep the transaction's own rate.
 *    NOTE: this replaces the action layer's old self-DM fallback (`getGroupPaidPolicies(allPolicies).at(0)`)
 *    so split init and the edit pages resolve the same policy. Deliberate behavior change for users whose
 *    active workspace differs from the first group-paid one.
 */
function getSplitEffectivePolicy({
    policy,
    searchSnapshotPolicy,
    transaction,
    draftTransaction,
    policyForCustomUnit,
    fallbackPolicy,
}: {
    policy: OnyxEntry<Policy>;
    searchSnapshotPolicy?: OnyxEntry<Policy>;
    transaction: OnyxEntry<Transaction>;
    draftTransaction?: OnyxEntry<Transaction>;
    policyForCustomUnit: OnyxEntry<Policy>;
    fallbackPolicy: OnyxEntry<Policy>;
}): OnyxEntry<Policy> {
    // Use the report's own policy when it's fully loaded (has an employee list); otherwise fall back to
    // the search results snapshot for it (when resolving from a search context).
    const currentPolicy = Object.keys(policy?.employeeList ?? {}).length ? policy : searchSnapshotPolicy;
    if (currentPolicy) {
        return currentPolicy;
    }

    if (policyForCustomUnit) {
        return policyForCustomUnit;
    }

    // Skip the workspace fallback for the P2P rate: `getRateForP2P` derives the rate from the policy's
    // output currency, so a fallback workspace with a different currency would ignore the transaction's
    // saved `defaultP2PRate` and compute the wrong rate. P2P expenses have no workspace policy anyway.
    const customUnitRateID = draftTransaction?.comment?.customUnit?.customUnitRateID ?? transaction?.comment?.customUnit?.customUnitRateID;
    const isP2PRate = customUnitRateID === CONST.CUSTOM_UNITS.FAKE_P2P_ID;
    return isP2PRate ? undefined : fallbackPolicy;
}

/**
 * Resolves the workspace policy for a split flow. Thin hook wrapper around {@link getSplitEffectivePolicy}
 * that gathers the required Onyx data (current policy incl. the search results snapshot, the custom-unit
 * policy, and the moving-expenses fallback). The custom-unit policy is read through a selector so we
 * don't subscribe the component to the entire policy collection.
 */
function useSplitEffectivePolicy(currentReport: OnyxEntry<Report>, draftTransaction: OnyxEntry<Transaction>, transaction?: OnyxEntry<Transaction>): OnyxEntry<Policy> {
    const {currentSearchResults} = useSearchResultsContext();
    const policy = usePolicy(currentReport?.policyID);
    const {policyForMovingExpenses} = usePolicyForMovingExpenses();

    const [policyForCustomUnit] = useOnyx(ONYXKEYS.COLLECTION.POLICY, {selector: (allPolicies) => findSplitPolicyForCustomUnit(allPolicies, transaction, draftTransaction)});

    const searchSnapshotPolicy = getPolicyFromSearchData(currentSearchResults?.data, currentReport?.policyID);

    return getSplitEffectivePolicy({policy, searchSnapshotPolicy, transaction, draftTransaction, policyForCustomUnit, fallbackPolicy: policyForMovingExpenses});
}

export {getSplitEffectivePolicy, findSplitPolicyForCustomUnit};
export default useSplitEffectivePolicy;
