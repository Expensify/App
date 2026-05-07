import React from 'react';
import CategoryPicker from '@components/CategoryPicker';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import type {ListItem} from '@components/SelectionList/types';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useSearchBulkEditPolicyID from '@hooks/useSearchBulkEditPolicyID';
import {updateBulkEditDraftTransaction} from '@libs/actions/IOU/BulkEdit';
import Navigation from '@libs/Navigation/Navigation';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

function SearchEditMultipleCategoryPage() {
    const {translate} = useLocalize();
    const [draftTransaction] = useOnyx(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${CONST.IOU.OPTIMISTIC_BULK_EDIT_TRANSACTION_ID}`);

    const policyID = useSearchBulkEditPolicyID();

    const currentCategory = draftTransaction?.category ?? '';

    const saveCategory = (item: ListItem) => {
        const nextCategory = item.searchText ?? '';
        if (!nextCategory || nextCategory === currentCategory) {
            updateBulkEditDraftTransaction({
                category: null,
            });
            Navigation.goBack();
            return;
        }
        updateBulkEditDraftTransaction({
            category: nextCategory,
        });
        Navigation.goBack();
    };

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom
            shouldEnableMaxHeight
            testID="SearchEditMultipleCategoryPage"
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

export default SearchEditMultipleCategoryPage;
