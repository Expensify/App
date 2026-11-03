import CategoryPickerModal from '@components/CategoryPicker/CategoryPickerModal';
import type {ExpenseFieldDropdownRenderProps} from '@components/MoneyRequestConfirmationList/sections/ExpenseFieldDropdown';
import type {ListItem} from '@components/SelectionList/types';

import useOnyx from '@hooks/useOnyx';
import useUpdateTransactionCategory from '@hooks/useUpdateTransactionCategory';

import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import createDynamicRoute from '@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute';
import Navigation from '@libs/Navigation/Navigation';
import TransitionTracker from '@libs/Navigation/TransitionTracker';

import CONST from '@src/CONST';
import type {IOUType} from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import {DYNAMIC_ROUTES} from '@src/ROUTES';
import type * as OnyxTypes from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';

import React from 'react';

type CategoryFieldDropdownProps = ExpenseFieldDropdownRenderProps & {
    /** ID of the expense the picked value is written to */
    transactionID: string;

    /** Expense the picked category is written to */
    transaction: OnyxEntry<OnyxTypes.Transaction>;

    /** Transaction thread report of the expense */
    transactionThreadReport: OnyxEntry<OnyxTypes.Report>;

    /** Policy the categories belong to */
    policy: OnyxEntry<OnyxTypes.Policy>;

    /** Category the expense already holds, so the list can mark it */
    selectedCategory: string;

    /** Type of the expense, which the page that creates a category is opened for */
    iouType: IOUType;

    /** Whether the user can create a category from the list, which then offers an add button */
    canAddCategory: boolean;
};

/**
 * The category list, anchored to the category row of a saved expense. Mounted only once the row is opened, and saves
 * through the same hook the full-page selector uses.
 */
function CategoryFieldDropdown({
    transactionID,
    transaction,
    transactionThreadReport,
    policy,
    selectedCategory,
    iouType,
    canAddCategory,
    onClose,
    ...popoverProps
}: CategoryFieldDropdownProps) {
    const [policyCategories] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${getNonEmptyStringOnyxID(policy?.id)}`);

    const {updateCategory} = useUpdateTransactionCategory({
        transactionID,
        transaction,
        report: transactionThreadReport,
        policy,
        policyCategories,
        isEditing: true,
        isEditingSplit: false,
    });

    // The page creates the category and applies it to the expense, then goes back here
    const openAddCategory = () => {
        const reportID = transactionThreadReport?.reportID;
        if (!reportID) {
            return;
        }
        onClose();
        TransitionTracker.runAfterTransitions({
            callback: () =>
                Navigation.navigate(createDynamicRoute(DYNAMIC_ROUTES.MONEY_REQUEST_STEP_CATEGORY_CREATE.getRoute({action: CONST.IOU.ACTION.EDIT, iouType, transactionID, reportID}))),
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
            addCategorySentryLabel={CONST.SENTRY_LABEL.MONEY_REQUEST.ADD_CATEGORY_BUTTON}
        />
    );
}

export default CategoryFieldDropdown;
