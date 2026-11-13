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
import {getTagArrayFromName} from '@libs/TransactionUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import {useRoute} from '@react-navigation/native';
import React from 'react';

import {getBulkEditTagChange, getCommonDependentTag} from './SearchEditMultipleUtils';

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
        updateBulkEditDraftTransaction(
            getBulkEditTagChange({
                selectedTagName: item.searchText ?? '',
                currentTag,
                tagListIndex,
                transactionTag,
                recordedTagChanges: draftTransaction?.bulkEditTagChanges ?? {},
                policyTags,
                hasDependentTags,
                hasMultipleTagLists: policy?.hasMultipleTagLists ?? false,
            }),
        );
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
