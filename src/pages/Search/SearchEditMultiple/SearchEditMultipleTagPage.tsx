import {useRoute} from '@react-navigation/native';
import React from 'react';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import TagPicker from '@components/TagPicker';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import {updateBulkEditDraftTransaction} from '@libs/actions/IOU';
import Navigation from '@libs/Navigation/Navigation';
import {getTagList, hasDependentTags as hasDependentTagsPolicyUtils} from '@libs/PolicyUtils';
import type {OptionData} from '@libs/ReportUtils';
import {getSearchBulkEditPolicyID} from '@libs/SearchUIUtils';
import {getUpdatedTransactionTag} from '@libs/TagsOptionsListUtils';
import {getTagArrayFromName} from '@libs/TransactionUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import getCommonDependentTag from './SearchEditMultipleUtils';

function SearchEditMultipleTagPage() {
    const {translate} = useLocalize();
    const [activePolicyID] = useOnyx(ONYXKEYS.NVP_ACTIVE_POLICY_ID, {canBeMissing: true});
    const [policies] = useOnyx(ONYXKEYS.COLLECTION.POLICY, {canBeMissing: true});
    const [draftTransaction] = useOnyx(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${CONST.IOU.OPTIMISTIC_BULK_EDIT_TRANSACTION_ID}`, {canBeMissing: true});
    const [allTransactions] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION, {canBeMissing: true});
    const [allReports] = useOnyx(ONYXKEYS.COLLECTION.REPORT, {canBeMissing: true});
    const route = useRoute();

    const selectedTransactionIDs = draftTransaction?.selectedTransactionIDs ?? [];

    const policyID = getSearchBulkEditPolicyID(selectedTransactionIDs, activePolicyID, allTransactions, allReports);

    const policy = policyID ? policies?.[`${ONYXKEYS.COLLECTION.POLICY}${policyID}`] : undefined;
    const [policyTags] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_TAGS}${policyID}`, {canBeMissing: true});

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
        const updatedTag = getUpdatedTransactionTag({
            transactionTag,
            selectedTagName: item.searchText ?? '',
            currentTag,
            tagListIndex,
            policyTags,
            hasDependentTags,
            hasMultipleTagLists: policy?.hasMultipleTagLists ?? false,
        });

        updateBulkEditDraftTransaction({
            tag: updatedTag,
        });
        Navigation.goBack();
    };

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom={false}
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
