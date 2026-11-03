import {getSelectedWorkspacePolicyID} from '@libs/IOUUtils';
import {getPolicyByCustomUnitID} from '@libs/PolicyUtils';
import {isExpenseUnreported} from '@libs/TransactionUtils';

import type {IOUAction} from '@src/CONST';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy, Transaction} from '@src/types/onyx';

import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';

import useOnyx from './useOnyx';
import usePolicyForMovingExpenses from './usePolicyForMovingExpenses';

type UsePolicyForTransactionParams = {
    /** The transaction to determine the policy for */
    transaction: OnyxEntry<Transaction>;

    /** The report policy ID associated with the transaction */
    reportPolicyID: string | undefined;

    /** The current action being performed */
    action: IOUAction;

    /** The type of IOU (split, track, submit, etc.) */
    iouType: string;

    /** The draft policy linked to the report */
    policyDraft?: OnyxEntry<Policy>;

    /** Indicates if the request is a per diem request */
    isPerDiemRequest?: boolean;
};

type UsePolicyForTransactionResult = {
    policy: OnyxEntry<Policy>;
};

function usePolicyForTransaction({
    transaction,
    reportPolicyID,
    action,
    iouType,
    policyDraft: policyDraftProp,
    isPerDiemRequest,
}: UsePolicyForTransactionParams): UsePolicyForTransactionResult {
    const {policyForMovingExpenses} = usePolicyForMovingExpenses();

    const [customUnitPolicy] = useOnyx(ONYXKEYS.COLLECTION.POLICY, {selector: (policies: OnyxCollection<Policy>) => getPolicyByCustomUnitID(transaction, policies)});

    // The route report can lag behind the workspace the user actually picked. The in-place "To" picker on the
    // confirmation page rewrites the transaction participants but leaves the route on the report the flow started
    // from - the self-DM, whose policyID is the '_FAKE_' placeholder. Resolving the picked workspace here means
    // every step page reached from the confirmation reads the same policy, instead of each one re-deriving it.
    const resolvedPolicyID = getSelectedWorkspacePolicyID(transaction, action) ?? reportPolicyID;

    const [reportPolicy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${resolvedPolicyID}`);
    // Fall back to the draft policy from Onyx so callers that don't explicitly pass one still resolve a
    // freshly created draft workspace (e.g. "Submit to my employer" with no existing workspace). Real
    // policies always take precedence below, so this only kicks in while the workspace is still a draft.
    const [policyDraftFromOnyx] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_DRAFTS}${resolvedPolicyID}`);
    const policyDraft = policyDraftProp ?? policyDraftFromOnyx;

    const isUnreportedExpense = isExpenseUnreported(transaction);
    const isCreatingTrackExpense = action === CONST.IOU.ACTION.CREATE && iouType === CONST.IOU.TYPE.TRACK;

    const policyForSelfDMExpense = isPerDiemRequest ? customUnitPolicy : policyForMovingExpenses;
    const policy = isUnreportedExpense || isCreatingTrackExpense ? policyForSelfDMExpense : (reportPolicy ?? policyDraft);

    return {policy};
}

export default usePolicyForTransaction;
