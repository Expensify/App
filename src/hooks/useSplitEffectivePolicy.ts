import type {OnyxEntry} from 'react-native-onyx';
import {useSearchResultsContext} from '@components/Search/SearchContext';
import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy, Report, Transaction} from '@src/types/onyx';
import useOnyx from './useOnyx';
import usePolicy from './usePolicy';
import usePolicyForMovingExpenses from './usePolicyForMovingExpenses';

/**
 * Resolves the workspace policy for a split flow.
 *
 * Resolution order:
 * 1. `currentReport.policyID` via `usePolicy` (or the search results snapshot for it).
 * 2. Policy matching the transaction's `customUnitID`.
 * 3. Policy matching the transaction's `customUnitRateID` (skipped for the P2P rate).
 * 4. `policyForMovingExpenses` — the user's active workspace for moving expenses. Needed for
 *    self-DM splits, which have no workspace-bound report/customUnit but still need a policy
 *    to resolve categories/tags (same fallback that `usePolicyForTransaction` uses for
 *    unreported expenses).
 *
 * Reads `customUnit` from `draftTransaction` first (the in-progress split draft), falling
 * back to `transaction` when the draft doesn't carry one yet (e.g. optimistic transaction
 * before the server response, or screens where the draft only holds a split list).
 */
function useSplitEffectivePolicy(currentReport: OnyxEntry<Report>, draftTransaction: OnyxEntry<Transaction>, transaction?: OnyxEntry<Transaction>): OnyxEntry<Policy> {
    const {currentSearchResults} = useSearchResultsContext();
    const policy = usePolicy(currentReport?.policyID);
    const [allPolicies] = useOnyx(ONYXKEYS.COLLECTION.POLICY);
    const {policyForMovingExpenses} = usePolicyForMovingExpenses();

    const currentPolicy = Object.keys(policy?.employeeList ?? {}).length
        ? policy
        : (currentSearchResults?.data?.[`${ONYXKEYS.COLLECTION.POLICY}${getNonEmptyStringOnyxID(currentReport?.policyID)}`] as OnyxEntry<Policy>);

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

    return policyForMovingExpenses;
}

export default useSplitEffectivePolicy;
