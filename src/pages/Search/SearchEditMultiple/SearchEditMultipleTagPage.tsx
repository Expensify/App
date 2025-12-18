import React from 'react';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import {useSearchContext} from '@components/Search/SearchContext';
import TagPicker from '@components/TagPicker';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import {updateBulkEditDraftTransaction} from '@libs/actions/IOU';
import Navigation from '@libs/Navigation/Navigation';
import type {OptionData} from '@libs/ReportUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

function SearchEditMultipleTagPage() {
    const {translate} = useLocalize();
    const {selectedTransactions} = useSearchContext();
    const [activePolicyID] = useOnyx(ONYXKEYS.NVP_ACTIVE_POLICY_ID, {canBeMissing: true});
    const [draftTransaction] = useOnyx(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${CONST.IOU.OPTIMISTIC_BULK_EDIT_TRANSACTION_ID}`, {canBeMissing: true});

    // Determine policyID based on context
    const transactionValues = Object.values(selectedTransactions);
    let policyID = activePolicyID;
    if (transactionValues.length > 0) {
        const firstPolicyID = transactionValues.at(0)?.policyID;
        const allSamePolicy = transactionValues.every((t) => t.policyID === firstPolicyID);

        if (allSamePolicy && firstPolicyID) {
            policyID = firstPolicyID;
        }
    }

    const [policyTags] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_TAGS}${policyID}`, {canBeMissing: true});

    const currentTag = draftTransaction?.tag ?? '';

    // Get the first tag list name
    let tagListName = '';
    if (policyTags) {
        const tagListKeys = Object.keys(policyTags);
        tagListName = tagListKeys.at(0) ?? '';
    }

    const saveTag = (item: Partial<OptionData>) => {
        updateBulkEditDraftTransaction({
            tag: item.searchText,
        });
        Navigation.goBack();
    };

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom={false}
            shouldEnableMaxHeight
            testID={SearchEditMultipleTagPage.displayName}
        >
            <HeaderWithBackButton
                title={translate('common.tag')}
                onBackButtonPress={Navigation.goBack}
            />
            <TagPicker
                policyID={policyID}
                selectedTag={currentTag}
                tagListName={tagListName}
                tagListIndex={0}
                onSubmit={saveTag}
            />
        </ScreenWrapper>
    );
}

SearchEditMultipleTagPage.displayName = 'SearchEditMultipleTagPage';

export default SearchEditMultipleTagPage;
