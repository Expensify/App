import {useSearchQueryContext} from '@components/Search/SearchContext';

import {setMoneyRequestCategory} from '@libs/actions/IOU/MoneyRequest';
import {setDraftSplitTransaction} from '@libs/actions/IOU/Split';
import {updateMoneyRequestCategory} from '@libs/actions/IOU/UpdateMoneyRequest';
import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type * as OnyxTypes from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';

import {isTrackIntentUserSelector} from '@selectors/Onboarding';
import {loginSelector} from '@selectors/PersonalDetails';

import useAllTransactionViolations from './useAllTransactionViolations';
import {useCurrencyListActions} from './useCurrencyList';
import useCurrentUserPersonalDetails from './useCurrentUserPersonalDetails';
import useDelegateAccountID from './useDelegateAccountID';
import useOnyx from './useOnyx';
import usePermissions from './usePermissions';
import {usePersonalDetail} from './usePersonalDetails';

type UseUpdateTransactionCategoryParams = {
    /** ID of the expense being written to. Also names the money request draft a not-yet-created expense lives in */
    transactionID: string;

    /** Transaction whose category is being written */
    transaction: OnyxEntry<OnyxTypes.Transaction>;

    /** Report the transaction lives on. Required to edit an existing expense's category */
    report: OnyxEntry<OnyxTypes.Report>;

    /** Policy the category belongs to */
    policy: OnyxEntry<OnyxTypes.Policy>;

    /** Categories configured on `policy`, needed to recompute violations after the write */
    policyCategories: OnyxEntry<OnyxTypes.PolicyCategories>;

    /** Whether an existing expense is being edited rather than a draft being filled in */
    isEditing: boolean;

    /** Whether the expense being edited is a split, which writes to the split draft instead */
    isEditingSplit: boolean;
};

type UseUpdateTransactionCategoryResult = {
    /** Writes `category` to whichever of the three stores backs the expense being edited */
    updateCategory: (category: string) => void;

    /**
     * Whether the write lands on the money request draft rather than on a saved expense. Callers that navigate
     * differently for a draft (the category step forwards into confirmation when categorizing a fresh expense)
     * read this instead of re-deriving which branch ran.
     */
    isDraftUpdate: boolean;
};

/**
 * Writes a category onto an expense, from wherever the category is picked.
 *
 * The three stores an expense can live in — the split draft, a saved transaction, and the money request draft —
 * each take a different write, and each write needs the same wide set of policy and user data to recompute the
 * expense's violations. That is why this lives in one hook rather than in each surface that offers the list: the
 * full-page selector and the confirmation form's anchored dropdown both save through it, so a category picked in
 * the dropdown lands exactly where the same pick on the full page would.
 */
function useUpdateTransactionCategory({
    transactionID,
    transaction,
    report,
    policy,
    policyCategories,
    isEditing,
    isEditingSplit,
}: UseUpdateTransactionCategoryParams): UseUpdateTransactionCategoryResult {
    const {getCurrencyDecimals, getCurrencySymbol} = useCurrencyListActions();
    const {currentSearchHash} = useSearchQueryContext();
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const delegateAccountID = useDelegateAccountID();
    const {isBetaEnabled, isBetaEnabledOrUnknown} = usePermissions();

    const policyID = policy?.id;

    const [splitDraftTransaction] = useOnyx(`${ONYXKEYS.COLLECTION.SPLIT_TRANSACTION_DRAFT}${transactionID}`);
    const [policyTags] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_TAGS}${policyID}`);
    const [policyRecentlyUsedCategories] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_RECENTLY_USED_CATEGORIES}${policyID}`);
    const [parentReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${getNonEmptyStringOnyxID(report?.parentReportID)}`);
    const [reportPolicyTags] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_TAGS}${getNonEmptyStringOnyxID(parentReport?.policyID)}`);
    const [iouReportOwnerLogin] = usePersonalDetail(parentReport?.ownerAccountID, loginSelector);
    const [isTrackIntentUser] = useOnyx(ONYXKEYS.NVP_INTRO_SELECTED, {selector: isTrackIntentUserSelector});
    const [rules] = useOnyx(ONYXKEYS.COLLECTION.RULE);
    const allTransactionViolations = useAllTransactionViolations(transactionID);

    const isSplitUpdate = isEditingSplit && !!transaction;
    const isExistingExpenseUpdate = !isSplitUpdate && isEditing && !!transaction && !!report;

    const updateCategory = (category: string) => {
        if (isSplitUpdate) {
            setDraftSplitTransaction(transaction.transactionID, splitDraftTransaction, {category}, getCurrencyDecimals, getCurrencySymbol, policy);
            return;
        }

        if (isExistingExpenseUpdate) {
            updateMoneyRequestCategory({
                isVendorMatchingBetaEnabled: isBetaEnabledOrUnknown(CONST.BETAS.VENDOR_MATCHING),
                transactionID: transaction.transactionID,
                transaction,
                transactionThreadReport: report,
                parentReport,
                iouReportOwnerLogin,
                category,
                policy,
                policyTagList: policyTags,
                policyCategories,
                policyRecentlyUsedCategories,
                currentUserAccountIDParam: currentUserPersonalDetails.accountID,
                currentUserEmailParam: currentUserPersonalDetails.login ?? '',
                isASAPSubmitBetaEnabled: isBetaEnabled(CONST.BETAS.ASAP_SUBMIT),
                hash: currentSearchHash,
                delegateAccountID,
                reportPolicyTags,
                isTrackIntentUser,
                violations: allTransactionViolations,
                getCurrencyDecimals,
                getCurrencySymbol,
                rules,
            });
            return;
        }

        setMoneyRequestCategory(transactionID, category, policy, getCurrencyDecimals);
    };

    return {updateCategory, isDraftUpdate: !isSplitUpdate && !isExistingExpenseUpdate};
}

export default useUpdateTransactionCategory;
