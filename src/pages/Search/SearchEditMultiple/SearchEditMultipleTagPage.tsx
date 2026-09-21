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
    // Only dependent tags auto-select the shared value on first open: their levels are a single chain, so
    // seeding the common tag is what lets child levels filter and rebuild. Independent lists are unrelated,
    // so seeding one list's shared value would drag a sibling list into the draft and a later deselect of
    // that untouched level would clear it (issue #100538). Keep them empty until the user picks.
    const autoSelectedTag = hasDependentTags ? (commonDependentTag ?? '') : '';
    const transactionTag = draftTag === undefined ? autoSelectedTag : draftTag;
    const currentTag = getTagArrayFromName(draftTag ?? '').at(tagListIndex) ?? '';

    const tagListName = getTagList(policyTags, tagListIndex).name;
    const headerTitle = tagListName || translate('common.tag');

    const saveTag = (item: Partial<OptionData>) => {
        const selectedTagName = item.searchText ?? '';
        // Tapping the level's own committed value deselects it.
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

        // Deselecting a pick made in this same draft drops the intent (net no-op). Any other deselect stays '' as a real clear.
        const isUndoingOwnPick = isDeselecting && recordedTagChanges[tagListIndex] === currentTag;
        const deselectValue = isUndoingOwnPick ? null : '';
        const bulkEditTagChanges: Record<string, string | null> = {[tagListIndex]: isDeselecting ? deselectValue : selectedTagName};
        // Dependent tags: editing a level invalidates deeper ones, so drop any stale child intents (merged draft would replay them).
        if (hasDependentTags) {
            for (const recordedIndex of Object.keys(recordedTagChanges)) {
                if (Number(recordedIndex) <= tagListIndex) {
                    continue;
                }
                bulkEditTagChanges[recordedIndex] = null;
            }
        }

        updateBulkEditDraftTransaction({
            // The flattened tag is display-only. bulkEditTagChanges is the single source of truth for the save.
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
