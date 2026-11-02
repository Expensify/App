/**
 * The category list of the expense detail view, in the container anchored to its category row. A pick saves to the
 * expense at once, through the same hook the full-page selector uses, so both leave the expense in the same state.
 */
import CategoryPickerModal from '@components/CategoryPicker/CategoryPickerModal';
import type {ListItem} from '@components/SelectionList/types';

import type {AnchoredFieldDropdownRenderProps} from '@hooks/useAnchoredFieldDropdown';
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

type MoneyRequestViewCategoryDropdownProps = AnchoredFieldDropdownRenderProps & {
    /** The saved expense the picked category is written to */
    transaction: OnyxTypes.Transaction;

    /** The expense's own thread, which the edit is made against, as on the full page */
    transactionThreadReport: OnyxTypes.Report;

    /** Workspace the categories come from. For an unreported expense, the workspace it would be moved to */
    policy: OnyxEntry<OnyxTypes.Policy>;

    /** The expense's raw category, empty when it has none, so the list can mark it and clear it when tapped again */
    selectedCategory: string;

    /** Type of the expense, which the add-category step needs to write the new category back to it */
    iouType: IOUType;

    /** Whether the user can add a category to the workspace from the list */
    canAddCategory: boolean;
};

function MoneyRequestViewCategoryDropdown({
    transaction,
    transactionThreadReport,
    policy,
    selectedCategory,
    iouType,
    canAddCategory,
    onClose,
    ...popoverProps
}: MoneyRequestViewCategoryDropdownProps) {
    const [policyCategories] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${getNonEmptyStringOnyxID(policy?.id)}`);

    const {updateCategory} = useUpdateTransactionCategory({
        transactionID: transaction.transactionID,
        transaction,
        report: transactionThreadReport,
        policy,
        policyCategories,
        isEditing: true,
        isEditingSplit: false,
    });

    const openAddCategory = () => {
        onClose();
        // Pushing a screen while the container is still closing can leave the new screen never shown on iOS.
        TransitionTracker.runAfterTransitions({
            callback: () =>
                Navigation.navigate(
                    createDynamicRoute(
                        DYNAMIC_ROUTES.MONEY_REQUEST_STEP_CATEGORY_CREATE.getRoute({
                            action: CONST.IOU.ACTION.EDIT,
                            iouType,
                            transactionID: transaction.transactionID,
                            reportID: transactionThreadReport.reportID,
                        }),
                    ),
                ),
            waitForUpcomingTransition: true,
        });
    };

    const saveCategory = (item: ListItem) => {
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
            onSelected={saveCategory}
            onAddCategory={canAddCategory ? openAddCategory : undefined}
            addCategorySentryLabel={CONST.SENTRY_LABEL.MONEY_REQUEST.DETAIL_ADD_CATEGORY_BUTTON}
        />
    );
}

export default MoneyRequestViewCategoryDropdown;
export type {MoneyRequestViewCategoryDropdownProps};
