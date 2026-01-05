import React from 'react';
import CategoryPicker from '@components/CategoryPicker';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import {useSearchContext} from '@components/Search/SearchContext';
import type {ListItem} from '@components/SelectionListWithSections/types';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import {updateBulkEditDraftTransaction} from '@libs/actions/IOU';
import Log from '@libs/Log';
import Navigation from '@libs/Navigation/Navigation';
import {getSearchBulkEditPolicyID} from '@libs/SearchUIUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

function SearchEditMultipleCategoryPage() {
    const {translate} = useLocalize();
    const {selectedTransactions} = useSearchContext();
    const [activePolicyID] = useOnyx(ONYXKEYS.NVP_ACTIVE_POLICY_ID, {canBeMissing: true});
    const [draftTransaction] = useOnyx(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${CONST.IOU.OPTIMISTIC_BULK_EDIT_TRANSACTION_ID}`, {canBeMissing: true});

    // Determine policyID based on context
    const policyID = getSearchBulkEditPolicyID(selectedTransactions, activePolicyID);

    const currentCategory = draftTransaction?.category ?? '';

    const saveCategory = (item: ListItem) => {
        if (!item.searchText) {
            Log.hmmm(`[SearchEditMultipleCategoryPage] no category selected for bulk edit`);
            Navigation.goBack();
            return;
        }
        updateBulkEditDraftTransaction({
            category: item.searchText,
        });
        Navigation.goBack();
    };

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom={false}
            shouldEnableMaxHeight
            testID={SearchEditMultipleCategoryPage.displayName}
        >
            <HeaderWithBackButton
                title={translate('common.category')}
                onBackButtonPress={Navigation.goBack}
            />
            <CategoryPicker
                policyID={policyID}
                selectedCategory={currentCategory}
                onSubmit={saveCategory}
            />
        </ScreenWrapper>
    );
}

SearchEditMultipleCategoryPage.displayName = 'SearchEditMultipleCategoryPage';

export default SearchEditMultipleCategoryPage;
