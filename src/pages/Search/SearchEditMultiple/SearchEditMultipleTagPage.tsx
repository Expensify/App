import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import TagPicker from '@components/TagPicker';

import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useSearchBulkEditPolicyID from '@hooks/useSearchBulkEditPolicyID';

import {updateBulkEditDraftTransaction} from '@libs/actions/IOU/BulkEdit';
import Navigation from '@libs/Navigation/Navigation';
import {getTagList, hasDependentTags as hasDependentTagsPolicyUtils} from '@libs/PolicyUtils';
import type {OptionData} from '@libs/ReportUtils';
import {getUpdatedTransactionTag} from '@libs/TagsOptionsListUtils';
import {getTagArrayFromName} from '@libs/TransactionUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import {useRoute} from '@react-navigation/native';
import React from 'react';

import {getCommonDependentTag} from './SearchEditMultipleUtils';

function SearchEditMultipleTagPage() {
    const {translate} = useLocalize();
    const [policies] = useOnyx(ONYXKEYS.COLLECTION.POLICY);
    const [draftTransaction] = useOnyx(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${CONST.IOU.OPTIMISTIC_BULK_EDIT_TRANSACTION_ID}`);
    const [allTransactions] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION);
    const route = useRoute();

    const selectedTransactionIDs = draftTransaction?.selectedTransactionIDs ?? [];

    const policyID = useSearchBulkEditPolicyID();

    const policy = policyID ? policies?.[`${ONYXKEYS.COLLECTION.POLICY}${policyID}`] : undefined;
    const [policyTags] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_TAGS}${policyID}`);

    const tagListIndex = Number((route.params as {tagListIndex?: string})?.tagListIndex ?? 0);
    const selectedTransactions = selectedTransactionIDs.map((transactionID) => allTransactions?.[`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`]);
    const commonDependentTag = getCommonDependentTag(selectedTransactions);
    const draftTag = draftTransaction?.tag;
    const transactionTag = draftTag === undefined ? (commonDependentTag ?? '') : draftTag;
    // Seed the current value from the shared/common tag (not the empty draft) so deselect detection
    // fires on the very first interaction, and the picker highlights the level's existing value.
    const currentTag = getTagArrayFromName(transactionTag).at(tagListIndex) ?? '';
    const hasDependentTags = hasDependentTagsPolicyUtils(policy, policyTags);

    const tagListName = getTagList(policyTags, tagListIndex).name;
    const headerTitle = tagListName || translate('common.tag');

    const saveTag = (item: Partial<OptionData>) => {
        const selectedTagName = item.searchText ?? '';
        // Resolve select vs. deselect once here against the shared/common tag. Storing the resolved
        // value (empty = clear) lets apply time force-set each transaction's level without re-deriving
        // the toggle from that transaction's own value, which would misfire when an expense already
        // has the selected value at this level.
        const resolvedTagName = selectedTagName === currentTag ? '' : selectedTagName;

        const updatedTag = getUpdatedTransactionTag({
            transactionTag,
            selectedTagName,
            currentTag,
            tagListIndex,
            policyTags,
            hasDependentTags,
            hasMultipleTagLists: policy?.hasMultipleTagLists ?? false,
        });

        updateBulkEditDraftTransaction({
            // Keep the flattened tag for the summary display, and record the per-level edit intent so
            // apply time can merge it into each transaction's own tag instead of overwriting all levels.
            tag: updatedTag,
            bulkEditTagChanges: {[tagListIndex]: resolvedTagName},
        });
        Navigation.goBack();
    };

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom
            shouldEnableMaxHeight
            testID="SearchEditMultipleTagPage"
        >
            <HeaderWithBackButton
                title={headerTitle}
                onBackButtonPress={Navigation.goBack}
            />
            <TagPicker
                policyID={policyID}
                selectedTag={currentTag}
                transactionTag={transactionTag}
                hasDependentTags={hasDependentTags}
                tagListName={tagListName}
                tagListIndex={tagListIndex}
                onSubmit={saveTag}
            />
        </ScreenWrapper>
    );
}

export default SearchEditMultipleTagPage;
