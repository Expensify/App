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
    const currentTag = getTagArrayFromName(draftTag ?? '').at(tagListIndex) ?? '';
    const hasDependentTags = hasDependentTagsPolicyUtils(policy, policyTags);

    const tagListName = getTagList(policyTags, tagListIndex).name;
    const headerTitle = tagListName || translate('common.tag');

    const saveTag = (item: Partial<OptionData>) => {
        const selectedTagName = item.searchText ?? '';
        // Tapping the value already committed in this draft means the user is clearing the level.
        // getUpdatedTransactionTag resolves the same thing internally for the displayed tag, but the
        // intent has to be resolved again here because apply time replays each recorded intent with an
        // empty currentTag. A raw tag name would read as a fresh selection there and re-add the level
        // the user just cleared, so record an empty value to carry the clear through.
        const isDeselecting = selectedTagName === currentTag;

        const updatedTag = getUpdatedTransactionTag({
            transactionTag,
            selectedTagName,
            currentTag,
            tagListIndex,
            policyTags,
            hasDependentTags,
            hasMultipleTagLists: policy?.hasMultipleTagLists ?? false,
        });

        // Record the per-level edit intent. For dependent tags, editing this level invalidates every
        // deeper (child) level, so drop any child intents previously recorded in the same draft. The
        // draft is merged, so without this a stale child edit would be replayed after this parent change
        // at apply time and re-add a child that no longer belongs under the newly selected parent, even
        // though the displayed updatedTag above already cleared it. Independent tags keep every level.
        const bulkEditTagChanges: Record<string, string | null> = {[tagListIndex]: isDeselecting ? '' : selectedTagName};
        if (hasDependentTags) {
            for (const recordedIndex of Object.keys(draftTransaction?.bulkEditTagChanges ?? {})) {
                if (Number(recordedIndex) <= tagListIndex) {
                    continue;
                }
                bulkEditTagChanges[recordedIndex] = null;
            }
        }

        updateBulkEditDraftTransaction({
            // Keep the flattened tag for the summary display, and record the per-level edit intent so
            // apply time can merge it into each transaction's own tag instead of overwriting all levels.
            tag: updatedTag,
            bulkEditTagChanges,
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
