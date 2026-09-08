import type PolicyData from '@hooks/usePolicyData/types';

import {getCategoryNameError, sanitizeCategoryName} from '@libs/CategoryUtils';

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

// eslint-disable-next-line import/prefer-default-export -- Named exports are intentional: this module aggregates inline-edit helpers for multiple policy items (tags, distance rates, etc. to follow).
export {renameCategoryInline};
