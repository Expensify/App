import type PolicyData from '@hooks/usePolicyData/types';

import {getCompanyCardNameError, sanitizeCompanyCardName} from '@libs/CardUtils';
import {getCategoryNameError, sanitizeCategoryName} from '@libs/CategoryUtils';
import {getCleanedTagName, getTagList} from '@libs/PolicyUtils';
import {getTagNameError, sanitizeTagName} from '@libs/TagUtils';

import {updateCompanyCardName} from '@userActions/CompanyCards';

import type {CompanyCardFeedWithNumber} from '@src/types/onyx/CardFeeds';

/**
 * Shared persistence helpers for inline editing of workspace policy items (categories, tags, distance
 * rates, etc.) from their respective Workspace Editor tables.
 *
 * Each helper delegates to the canonical item action (e.g. `renamePolicyCategory`) which owns the
 * optimistic Onyx write, the API call, and failure rollback. Name validation is shared with the RHP
 * edit forms and lives alongside the item's utils (e.g. `getCategoryNameError` in `CategoryUtils`).
 * Add new items as additional sections below rather than creating a file per item.
 */
import {renamePolicyCategory} from './Category';
import {renamePolicyTag} from './Tag';

// #region Categories

/**
 * Renames a category from an inline table edit. Sanitizes the input and delegates to the canonical
 * rename action. Silently no-ops when the name is unchanged or fails validation (matching the Spend
 * inline-edit behavior, where an invalid edit reverts to the original value without an error).
 */
function renameCategoryInline(policyData: PolicyData, currentName: string, newName: string): void {
    const sanitized = sanitizeCategoryName(newName);

    if (sanitized === currentName || getCategoryNameError(policyData.categories, newName, currentName)) {
        return;
    }

    renamePolicyCategory(policyData, {oldName: currentName, newName: sanitized});
}

// #endregion Categories

// #region Tags

/**
 * Renames a single-level tag from an inline table edit. `oldName` is the raw (escaped) tag name used as
 * the Onyx key, while the cell edits the decoded display name. Sanitizes the input and delegates to the
 * canonical rename action. Silently no-ops when the name is unchanged or fails validation (matching the
 * Spend inline-edit behavior, where an invalid edit reverts to the original value without an error).
 */
function renameTagInline(policyData: PolicyData, oldName: string, newName: string): void {
    const sanitized = sanitizeTagName(newName);
    const currentDisplayName = getCleanedTagName(oldName);
    const {tags} = getTagList(policyData.tags, 0);

    if (sanitized === currentDisplayName || getTagNameError(tags, newName, currentDisplayName)) {
        return;
    }

    renamePolicyTag(policyData, {oldName, newName: sanitized}, 0);
}

// #endregion Tags

// #region Company Cards

/**
 * Renames a company card from an inline table edit. Sanitizes the input and delegates to the canonical
 * rename action. Silently no-ops when the name is unchanged or fails validation (matching the Spend
 * inline-edit behavior, where an invalid edit reverts to the original value without an error).
 */
function renameCompanyCardInline(domainOrWorkspaceAccountID: number, cardID: string, newName: string, bankName: CompanyCardFeedWithNumber, currentName: string): void {
    const sanitized = sanitizeCompanyCardName(newName);

    if (sanitized === currentName || getCompanyCardNameError(newName)) {
        return;
    }

    updateCompanyCardName(domainOrWorkspaceAccountID, cardID, sanitized, bankName, currentName);
}

// #endregion Company Cards

export {renameCategoryInline, renameTagInline, renameCompanyCardInline};
