import CategoryPickerModal from '@components/CategoryPicker/CategoryPickerModal';
import {useConfirmationFields} from '@components/MoneyRequestConfirmationFields/context';
import type {ListItem} from '@components/SelectionList/types';

import useOnyx from '@hooks/useOnyx';
import useUpdateTransactionCategory from '@hooks/useUpdateTransactionCategory';

import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type * as OnyxTypes from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';

import React from 'react';

import type {ExpenseFieldDropdownRenderProps} from './ExpenseFieldDropdown';

type CategoryFieldDropdownProps = ExpenseFieldDropdownRenderProps & {
    /** ID of the expense the picked category is written to */
    transactionID: string;

    /** Policy the categories belong to */
    policy: OnyxEntry<OnyxTypes.Policy>;

    /** Category the expense already holds, so the list can mark it and a second tap on it can clear it */
    selectedCategory: string;
};

/**
 * The category list, in the container anchored to the expense form's category row.
 *
 * Mounted only once the row has been opened, which is what keeps the list's Onyx subscriptions and the option
 * building behind them off the form's first render. It saves through the same hook the full-page selector saves
 * through, so picking here and picking there leave the expense in the same state.
 */
function CategoryFieldDropdown({transactionID, policy, selectedCategory, onClose, ...popoverProps}: CategoryFieldDropdownProps) {
    const {reportID, isEditingSplitBill, action} = useConfirmationFields();

    const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`);
    const [transaction] = useOnyx(`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`);
    const [draftTransaction] = useOnyx(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${transactionID}`);
    const [policyCategories] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${getNonEmptyStringOnyxID(policy?.id)}`);

    const {updateCategory} = useUpdateTransactionCategory({
        transactionID,
        transaction: draftTransaction ?? transaction,
        report,
        policy,
        policyCategories,
        isEditing: action === CONST.IOU.ACTION.EDIT,
        isEditingSplit: isEditingSplitBill,
    });

    const handleSelected = (item: ListItem) => {
        // `CategoryPickerModal` hands back an empty item when the selected category is tapped again, which is the
        // same clearing the full-page selector does, so both land on an empty category here.
        updateCategory(item.searchText ?? '');
    };

    return (
        <CategoryPickerModal
            {...popoverProps}
            onClose={onClose}
            shouldFitContentHeight
            policyID={policy?.id}
            selectedCategory={selectedCategory}
            onSelected={handleSelected}
        />
    );
}

export default CategoryFieldDropdown;
