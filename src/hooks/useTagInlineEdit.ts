import {renameTagInline} from '@libs/actions/Policy/InlineEdit';

import type PolicyData from './usePolicyData/types';

type UseTagInlineEditParams = {
    /** Policy data (policy, tags, etc.) for the workspace being edited */
    policyData: PolicyData;

    /** Whether the current user can edit tags on this policy */
    canWriteTags: boolean;

    /** Shown when the user attempts to edit while lacking write access */
    showReadOnlyModal: () => void;
};

/**
 * Provides inline-edit capabilities for the workspace tags table: a permission flag and a save handler
 * that persists the rename. Invalid names are silently reverted by `renameTagInline` (matching the Spend
 * inline-edit behavior), so no error is surfaced from the cell.
 */
function useTagInlineEdit({policyData, canWriteTags, showReadOnlyModal}: UseTagInlineEditParams) {
    const renameTag = (currentName: string, newName: string) => {
        if (!canWriteTags) {
            showReadOnlyModal();
            return;
        }

        renameTagInline(policyData, currentName, newName);
    };

    return {canEditName: canWriteTags, renameTag};
}

export default useTagInlineEdit;
