import type PolicyData from '@hooks/usePolicyData/types';

import {getCompanyCardNameError, getExpensifyCardNameError, sanitizeCompanyCardName} from '@libs/CardUtils';
import {getCategoryNameError, sanitizeCategoryName} from '@libs/CategoryUtils';
import {getCleanedTagName, getTagList} from '@libs/PolicyUtils';
import {getTagNameError, sanitizeTagName} from '@libs/TagUtils';

import {updateExpensifyCardTitle} from '@userActions/Card';
import {updateCompanyCardName} from '@userActions/CompanyCards';

import CONST from '@src/CONST';
import type {Policy} from '@src/types/onyx';
import type {CompanyCardFeedWithNumber} from '@src/types/onyx/CardFeeds';

import type {OnyxEntry} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';

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
import {updateWorkspaceMembersRole} from './Member';
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

// #region Expensify Cards

/**
 * Renames an Expensify card from an inline table edit. Delegates to the canonical rename action
 * without extra sanitization, matching the RHP edit form. Silently no-ops when the name is
 * unchanged or fails validation (matching the Spend inline-edit behavior, where an invalid edit
 * reverts to the original value without an error).
 */
function renameExpensifyCardInline(workspaceAccountID: number, cardID: number, newName: string, currentName: string): void {
    if (newName === currentName || getExpensifyCardNameError(newName)) {
        return;
    }

    updateExpensifyCardTitle(workspaceAccountID, cardID, newName, currentName);
}

// #endregion Expensify Cards

// #region Members

function isPolicyRole(role: string): role is ValueOf<typeof CONST.POLICY.ROLE> {
    switch (role) {
        case CONST.POLICY.ROLE.OWNER:
        case CONST.POLICY.ROLE.ADMIN:
        case CONST.POLICY.ROLE.AUDITOR:
        case CONST.POLICY.ROLE.USER:
        case CONST.POLICY.ROLE.EDITOR:
        case CONST.POLICY.ROLE.CARD_ADMIN:
        case CONST.POLICY.ROLE.PEOPLE_ADMIN:
        case CONST.POLICY.ROLE.PAYMENTS_ADMIN:
            return true;
        default:
            return false;
    }
}

/**
 * Changes a member's role from an inline table edit. Delegates to the canonical role action, which
 * owns the optimistic Onyx write, the API call, and failure rollback. Silently no-ops when the role
 * is unchanged or not a known policy role (matching the Spend inline-edit behavior).
 */
function updateMemberRoleInline(policy: OnyxEntry<Policy>, memberLogin: string, accountID: number, currentRole: string | undefined, newRole: string): void {
    if (!memberLogin || newRole === currentRole || !isPolicyRole(newRole)) {
        return;
    }

    updateWorkspaceMembersRole(policy, [memberLogin], [accountID], newRole);
}

// #endregion Members

export {renameCategoryInline, renameTagInline, renameCompanyCardInline, renameExpensifyCardInline, updateMemberRoleInline};
