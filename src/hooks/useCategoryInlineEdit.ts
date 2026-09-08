import {renameCategoryInline} from '@libs/actions/Policy/InlineEdit';

import type PolicyData from './usePolicyData/types';

type UseCategoryInlineEditParams = {
    /** Policy data (policy, categories, etc.) for the workspace being edited */
    policyData: PolicyData;

    /** Whether the current user can edit categories on this policy */
    canWriteCategories: boolean;

    /** Shown when the user attempts to edit while lacking write access */
    showReadOnlyModal: () => void;
};

/**
 * Provides inline-edit capabilities for the workspace categories table: a permission flag and a save
 * handler that persists the rename. Invalid names are silently reverted by `renameCategoryInline`
 * (matching the Spend inline-edit behavior), so no error is surfaced from the cell.
 */
function useCategoryInlineEdit({policyData, canWriteCategories, showReadOnlyModal}: UseCategoryInlineEditParams) {
    const renameCategory = (currentName: string, newName: string) => {
        if (!canWriteCategories) {
            showReadOnlyModal();
            return;
        }

        renameCategoryInline(policyData, currentName, newName);
    };

    return {canEditName: canWriteCategories, renameCategory};
}

export default useCategoryInlineEdit;
