import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';
import {useSearchResultsContext} from '@components/Search/SearchContext';
import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy, Report, Transaction} from '@src/types/onyx';
import useOnyx from './useOnyx';
import usePolicy from './usePolicy';
import usePolicyForMovingExpenses from './usePolicyForMovingExpenses';

/**
 * Pure resolver for the workspace policy used across the split flow.
 *
 * This is the single source of truth shared by `useSplitEffectivePolicy` (the hook used on the
 * split pages) and by the action layer (`initSplitExpense` / `useDeleteTransactions`) where hooks
 * can't be called. Keeping one implementation prevents drift: if the initial split and a later
 * mutation resolved different policies, they'd build distance splits against different mileage rates.
 *
 * Resolution order:
 * 1. `currentPolicy` — the report's policy, when provided by the caller.
 * 2. Policy matching the transaction's `customUnitID`.
 * 3. Policy matching the transaction's `customUnitRateID` (skipped for the P2P rate).
 * 4. `fallbackPolicy` — the user's active workspace for moving expenses. Needed for self-DM splits,
 *    which have no workspace-bound report/customUnit but still need a policy to resolve categories/tags.
 *
 * Reads `customUnit` from `draftTransaction` first (the in-progress split draft), falling back to
 * `transaction` when the draft doesn't carry one yet (e.g. optimistic transaction before the server
 * response, or screens where the draft only holds a split list).
 */
function getSplitEffectivePolicy({
    policy,
    searchSnapshotPolicy,
    transaction,
    draftTransaction,
    allPolicies,
    fallbackPolicy,
}: {
    policy: OnyxEntry<Policy>;
    searchSnapshotPolicy?: OnyxEntry<Policy>;
    transaction: OnyxEntry<Transaction>;
    draftTransaction?: OnyxEntry<Transaction>;
    allPolicies: OnyxCollection<Policy>;
    fallbackPolicy: OnyxEntry<Policy>;
}): OnyxEntry<Policy> {
    // Use the report's own policy when it's fully loaded (has an employee list); otherwise fall back to
    // the search results snapshot for it (when resolving from a search context).
    const currentPolicy = Object.keys(policy?.employeeList ?? {}).length ? policy : searchSnapshotPolicy;
    if (currentPolicy) {
        return currentPolicy;
    }

    const customUnitID = draftTransaction?.comment?.customUnit?.customUnitID ?? transaction?.comment?.customUnit?.customUnitID;
    const customUnitRateID = draftTransaction?.comment?.customUnit?.customUnitRateID ?? transaction?.comment?.customUnit?.customUnitRateID;
    const isP2PRate = customUnitRateID === CONST.CUSTOM_UNITS.FAKE_P2P_ID;

    const policyByCustomUnitID = !isP2PRate && customUnitID ? (Object.values(allPolicies ?? {}).find((p) => p?.customUnits?.[customUnitID]) ?? undefined) : undefined;
    if (policyByCustomUnitID) {
        return policyByCustomUnitID;
    }

    const policyByCustomUnitRateID =
        !isP2PRate && customUnitRateID
            ? (Object.values(allPolicies ?? {}).find((p) => Object.values(p?.customUnits ?? {}).some((unit) => !!unit.rates?.[customUnitRateID])) ?? undefined)
            : undefined;
    if (policyByCustomUnitRateID) {
        return policyByCustomUnitRateID;
    }

    return fallbackPolicy;
}

/**
 * Resolves the workspace policy for a split flow. Thin hook wrapper around {@link getSplitEffectivePolicy}
 * that gathers the required Onyx data (current policy incl. the search results snapshot, all policies,
 * and the moving-expenses fallback).
 */
function useSplitEffectivePolicy(currentReport: OnyxEntry<Report>, draftTransaction: OnyxEntry<Transaction>, transaction?: OnyxEntry<Transaction>): OnyxEntry<Policy> {
    const {currentSearchResults} = useSearchResultsContext();
    const policy = usePolicy(currentReport?.policyID);
    const [allPolicies] = useOnyx(ONYXKEYS.COLLECTION.POLICY);
    const {policyForMovingExpenses} = usePolicyForMovingExpenses();

    const searchSnapshotPolicy = currentSearchResults?.data?.[`${ONYXKEYS.COLLECTION.POLICY}${getNonEmptyStringOnyxID(currentReport?.policyID)}`] as OnyxEntry<Policy>;

    return getSplitEffectivePolicy({policy, searchSnapshotPolicy, transaction, draftTransaction, allPolicies, fallbackPolicy: policyForMovingExpenses});
}

export {getSplitEffectivePolicy};
export default useSplitEffectivePolicy;
