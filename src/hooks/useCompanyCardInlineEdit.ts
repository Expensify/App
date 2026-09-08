import {renameCompanyCardInline} from '@libs/actions/Policy/InlineEdit';

import type {CompanyCardFeedWithNumber} from '@src/types/onyx/CardFeeds';

type UseCompanyCardInlineEditParams = {
    /** Domain or workspace account ID used by the company card name API */
    domainOrWorkspaceAccountID: number;

    /** Selected feed's bank name. Inline rename no-ops until a feed is resolved. */
    bankName: CompanyCardFeedWithNumber | undefined;

    /** Whether the current user can edit company cards on this policy */
    canWriteCompanyCards: boolean;
};

/**
 * Provides inline-edit capabilities for the workspace company cards table: a permission flag and a save
 * handler that persists the rename. Invalid names are silently reverted by `renameCompanyCardInline`
 * (matching the Spend inline-edit behavior), so no error is surfaced from the cell.
 */
function useCompanyCardInlineEdit({domainOrWorkspaceAccountID, bankName, canWriteCompanyCards}: UseCompanyCardInlineEditParams) {
    const renameCard = (cardID: string, currentName: string, newName: string) => {
        if (!canWriteCompanyCards || !bankName) {
            return;
        }

        renameCompanyCardInline(domainOrWorkspaceAccountID, cardID, newName, bankName, currentName);
    };

    return {canEditName: canWriteCompanyCards && !!bankName, renameCard};
}

export default useCompanyCardInlineEdit;
