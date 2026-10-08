import CategoryPickerModal from '@components/CategoryPicker/CategoryPickerModal';
import {useConfirmationFields} from '@components/MoneyRequestConfirmationFields/context';
import type {ListItem} from '@components/SelectionList/types';

import useOnyx from '@hooks/useOnyx';
import useUpdateTransactionCategory from '@hooks/useUpdateTransactionCategory';

import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import createDynamicRoute from '@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute';
import Navigation from '@libs/Navigation/Navigation';
import TransitionTracker from '@libs/Navigation/TransitionTracker';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import {DYNAMIC_ROUTES} from '@src/ROUTES';
import type * as OnyxTypes from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';

import React from 'react';

import type {ExpenseFieldDropdownRenderProps} from './ExpenseFieldDropdown';

type CategoryFieldDropdownProps = ExpenseFieldDropdownRenderProps & {
    /** ID of the expense the picked category is written to */
    transactionID: string;

    /** Policy the categories belong to */
    policy: OnyxEntry<OnyxTypes.Policy>;

    /** Category the expense already holds, so the list can mark it */
    selectedCategory: string;

    /** Whether the user can add a category to the workspace from the list */
    canAddCategory: boolean;
};

/**
 * The category list, in the container anchored to the expense form's category row. Mounted only once the row is
 * opened, keeping its Onyx subscriptions off the form's first render, and saves through the same hook the
 * full-page selector uses so both leave the expense in the same state.
 */
function CategoryFieldDropdown({transactionID, policy, selectedCategory, canAddCategory, onClose, ...popoverProps}: CategoryFieldDropdownProps) {
    const {reportID, isEditingSplitBill, action, iouType} = useConfirmationFields();

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

    const openAddCategory = () => {
        onClose();
        TransitionTracker.runAfterTransitions({
            callback: () => Navigation.navigate(createDynamicRoute(DYNAMIC_ROUTES.MONEY_REQUEST_STEP_CATEGORY_CREATE.getRoute({action, iouType, transactionID, reportID}))),
            waitForUpcomingTransition: true,
        });
    };

    const handleSelected = (item: ListItem) => {
        // `CategoryPickerModal` hands back an empty item when the selected category is tapped again, clearing it.
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
            onAddCategory={canAddCategory ? openAddCategory : undefined}
            addCategorySentryLabel={CONST.SENTRY_LABEL.REQUEST_CONFIRMATION_LIST.ADD_CATEGORY_BUTTON}
        />
    );
}

export default CategoryFieldDropdown;
