import {renameExpensifyCardInline} from '@libs/actions/Policy/InlineEdit';

type UseExpensifyCardInlineEditParams = {
    /** Workspace account / fund ID used by the Expensify card title API */
    fundID: number;

    /** Whether the current user can edit Expensify cards on this policy */
    canWriteExpensifyCard: boolean;

    /** Shown when the user attempts to edit while lacking write access */
    showReadOnlyModal: () => void;
};

/**
 * Provides inline-edit capabilities for the workspace Expensify cards table: a permission flag and a
 * save handler that persists the rename. Invalid names are silently reverted by
 * `renameExpensifyCardInline` (matching the Spend inline-edit behavior), so no error is surfaced
 * from the cell.
 */
function useExpensifyCardInlineEdit({fundID, canWriteExpensifyCard, showReadOnlyModal}: UseExpensifyCardInlineEditParams) {
    const renameCard = (cardID: number, currentName: string, newName: string) => {
        if (!canWriteExpensifyCard) {
            showReadOnlyModal();
            return;
        }

        renameExpensifyCardInline(fundID, cardID, newName, currentName);
    };

    return {canEditName: canWriteExpensifyCard, renameCard};
}

export default useExpensifyCardInlineEdit;
