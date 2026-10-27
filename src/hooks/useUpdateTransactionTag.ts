import {useSearchQueryContext} from '@components/Search/SearchContext';

import {setMoneyRequestDraftHasUserEdits, setMoneyRequestTag} from '@libs/actions/IOU/MoneyRequest';
import {setDraftSplitTransaction} from '@libs/actions/IOU/Split';
import {updateMoneyRequestTag} from '@libs/actions/IOU/UpdateMoneyRequest';
import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import {getTagLists, hasDependentTags as hasDependentTagsPolicyUtils} from '@libs/PolicyUtils';
import {getUpdatedTransactionTag} from '@libs/TagsOptionsListUtils';
import {getTag} from '@libs/TransactionUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type * as OnyxTypes from '@src/types/onyx';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

import type {OnyxEntry} from 'react-native-onyx';

import {isTrackIntentUserSelector} from '@selectors/Onboarding';
import {loginSelector} from '@selectors/PersonalDetails';

import useAllTransactionViolations from './useAllTransactionViolations';
import {useCurrencyListActions} from './useCurrencyList';
import useCurrentUserPersonalDetails from './useCurrentUserPersonalDetails';
import useDelegateAccountID from './useDelegateAccountID';
import useNetwork from './useNetwork';
import useOnyx from './useOnyx';
import usePermissions from './usePermissions';
import {usePersonalDetail} from './usePersonalDetails';

type UseUpdateTransactionTagParams = {
    /** ID of the expense being written to, and of the draft a not-yet-created expense lives in */
    transactionID: string;

    /** Transaction whose tag is being written */
    transaction: OnyxEntry<OnyxTypes.Transaction>;

    /** Report the transaction lives on. Required to edit an existing expense's tag */
    report: OnyxEntry<OnyxTypes.Report>;

    /** Policy the tags belong to */
    policy: OnyxEntry<OnyxTypes.Policy>;

    /** Tag lists configured on `policy` */
    policyTags: OnyxEntry<OnyxTypes.PolicyTagLists>;

    /** Index of the tag list the pick belongs to */
    tagListIndex: number;

    /** Whether an existing expense is being edited rather than a draft being filled in */
    isEditing: boolean;

    /** Whether the expense being edited is a split, which writes to the split draft instead */
    isEditingSplit: boolean;
};

type UseUpdateTransactionTagResult = {
    /** Writes the picked tag into its list's slot of the expense's tag, clearing it when the current tag is picked again */
    updateTag: (selectedTagName: string) => void;
};

/**
 * Writes a tag onto an expense, from wherever it is picked. Both the full-page selector and the anchored dropdown save
 * through here, so a pick in either lands in the same place.
 */
function useUpdateTransactionTag({
    transactionID,
    transaction,
    report,
    policy,
    policyTags,
    tagListIndex,
    isEditing,
    isEditingSplit,
}: UseUpdateTransactionTagParams): UseUpdateTransactionTagResult {
    const {getCurrencyDecimals, getCurrencySymbol} = useCurrencyListActions();
    const {currentSearchHash} = useSearchQueryContext();
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const delegateAccountID = useDelegateAccountID();
    const {isBetaEnabled, isBetaEnabledOrUnknown} = usePermissions();
    const {isOffline} = useNetwork();

    const policyID = policy?.id;

    const [splitDraftTransaction] = useOnyx(`${ONYXKEYS.COLLECTION.SPLIT_TRANSACTION_DRAFT}${transactionID}`);
    const [policyCategories] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${getNonEmptyStringOnyxID(policyID)}`);
    const [policyRecentlyUsedTags] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_RECENTLY_USED_TAGS}${getNonEmptyStringOnyxID(policyID)}`);
    const [parentReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${getNonEmptyStringOnyxID(report?.parentReportID)}`);
    const [reportPolicyTags] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_TAGS}${getNonEmptyStringOnyxID(parentReport?.policyID)}`);
    const [iouReportOwnerLogin] = usePersonalDetail(parentReport?.ownerAccountID, loginSelector);
    const [isTrackIntentUser] = useOnyx(ONYXKEYS.NVP_INTRO_SELECTED, {selector: isTrackIntentUserSelector});
    const [rules] = useOnyx(ONYXKEYS.COLLECTION.RULE);
    const allTransactionViolations = useAllTransactionViolations(transactionID);
    // Only a completed read guarantees every tag list is known, which the dependent-tag write needs to count them. The
    // picker beside this owns that read, so this only watches it rather than starting another.
    const [policyTagsLoadingState] = useOnyx(`${ONYXKEYS.COLLECTION.RAM_ONLY_POLICY_TAGS_LOADING_STATE}${getNonEmptyStringOnyxID(policyID)}`);
    const hasLoadedPolicyTags = !!policyTagsLoadingState?.hasOnceLoaded;

    const currentTransaction = isEditingSplit && !isEmptyObject(splitDraftTransaction) ? splitDraftTransaction : transaction;

    const updateTag = (selectedTagName: string) => {
        const updatedTag = getUpdatedTransactionTag({
            transactionTag: getTag(currentTransaction),
            selectedTagName,
            currentTag: getTag(currentTransaction, tagListIndex),
            tagListIndex,
            policyTags,
            hasDependentTags: hasDependentTagsPolicyUtils(policy, policyTags),
            hasMultipleTagLists: policy?.hasMultipleTagLists ?? false,
            tagListCount: hasLoadedPolicyTags ? getTagLists(policyTags).length : undefined,
        });

        if (isEditingSplit) {
            setDraftSplitTransaction(transactionID, splitDraftTransaction, {tag: updatedTag}, getCurrencyDecimals, getCurrencySymbol);
            return;
        }

        if (isEditing) {
            updateMoneyRequestTag({
                isVendorMatchingBetaEnabled: isBetaEnabledOrUnknown(CONST.BETAS.VENDOR_MATCHING),
                transactionID,
                transaction,
                transactionThreadReport: report,
                parentReport,
                iouReportOwnerLogin,
                tag: updatedTag,
                tagListIndex,
                policy,
                policyTagList: policyTags,
                policyRecentlyUsedTags,
                policyCategories,
                currentUserAccountIDParam: currentUserPersonalDetails.accountID,
                currentUserEmailParam: currentUserPersonalDetails.login ?? '',
                isASAPSubmitBetaEnabled: isBetaEnabled(CONST.BETAS.ASAP_SUBMIT),
                hash: currentSearchHash,
                isOffline,
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

        setMoneyRequestTag(transactionID, updatedTag);
        setMoneyRequestDraftHasUserEdits(transactionID);
    };

    return {updateTag};
}

export default useUpdateTransactionTag;
