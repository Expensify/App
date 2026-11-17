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
    const hasDependentTags = hasDependentTagsPolicyUtils(policy, policyTags);

    // Only prefill dependent tags. Their child tags need the selected parent.
    // Leave independent tag lists empty until the user selects a tag.
    const autoSelectedTag = hasDependentTags ? (commonDependentTag ?? '') : '';
    const transactionTag = draftTag === undefined ? autoSelectedTag : draftTag;
    const currentTag = getTagArrayFromName(draftTag ?? '').at(tagListIndex) ?? '';

    const tagListName = getTagList(policyTags, tagListIndex).name;
    const headerTitle = tagListName || translate('common.tag');

    const saveTag = (item: Partial<OptionData>) => {
        const selectedTagName = item.searchText ?? '';

        // Tapping the value that's already set on this level clears it.
        const isDeselecting = selectedTagName === currentTag;
        const recordedTagChanges = draftTransaction?.bulkEditTagChanges ?? {};

        const updatedTag = getUpdatedTransactionTag({
            transactionTag,
            selectedTagName,
            currentTag,
            tagListIndex,
            policyTags,
            hasDependentTags,
            hasMultipleTagLists: policy?.hasMultipleTagLists ?? false,
        });

        // If the user picks and then removes a tag before saving, do not save a change.
        // Otherwise, remove the tag.
        const isUndoingOwnPick = isDeselecting && recordedTagChanges[tagListIndex] === currentTag;
        const deselectValue = isUndoingOwnPick ? null : '';
        const bulkEditTagChanges: Record<string, string | null> = {[tagListIndex]: isDeselecting ? deselectValue : selectedTagName};

        // For dependent tags, changing a level makes the deeper ones stale, so clear any child intents still in the draft before they get replayed.
        if (hasDependentTags) {
            for (const recordedIndex of Object.keys(recordedTagChanges)) {
                if (Number(recordedIndex) <= tagListIndex) {
                    continue;
                }
                bulkEditTagChanges[recordedIndex] = null;
            }
        }

        updateBulkEditDraftTransaction({
            // tag is only for display here, bulkEditTagChanges is what drives the save.
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
