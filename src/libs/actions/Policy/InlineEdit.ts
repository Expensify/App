import type PolicyData from '@hooks/usePolicyData/types';

import {
    getCompanyCardNameError,
    getExpensifyCardLimitError,
    getExpensifyCardNameError,
    getExpensifyCardNewAvailableSpend,
    sanitizeCompanyCardName,
    shouldShowExpensifyCardFixedLimitType,
} from '@libs/CardUtils';
import {getCategoryNameError, sanitizeCategoryName} from '@libs/CategoryUtils';
import {getDistanceRateNameError, getDistanceRateValueError, sanitizeDistanceRateName} from '@libs/PolicyDistanceRatesUtils';
import {getCleanedTagName, getTagList} from '@libs/PolicyUtils';
import {getTagNameError, sanitizeTagName} from '@libs/TagUtils';

import {updateExpensifyCardLimit, updateExpensifyCardLimitType, updateExpensifyCardTitle} from '@userActions/Card';
import {updateCompanyCardName} from '@userActions/CompanyCards';

import CONST from '@src/CONST';
import type {Card, Policy} from '@src/types/onyx';
import type {CardLimitType} from '@src/types/onyx/Card';
import type {CompanyCardFeedWithNumber} from '@src/types/onyx/CardFeeds';
import type {CustomUnit, Rate} from '@src/types/onyx/Policy';

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
import {updatePolicyDistanceRateName, updatePolicyDistanceRateValue} from './DistanceRate';
import {updateWorkspaceMembersRole} from './Member';
import {renamePolicyTag} from './Tag';

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

/**
 * Renames a distance rate from an inline table edit. Sanitizes the input and delegates to the
 * canonical rename action. Silently no-ops when the name is unchanged or fails validation
 * (matching the Spend inline-edit behavior, where an invalid edit reverts to the original
 * value without an error).
 */
function renameDistanceRateInline(policyID: string, customUnit: CustomUnit, rate: Rate, newName: string): void {
    const sanitized = sanitizeDistanceRateName(newName);
    const currentName = rate.name ?? '';
    const existingRateNames = Object.values(customUnit.rates ?? {}).map((existingRate) => existingRate.name ?? '');

    if (sanitized === currentName || getDistanceRateNameError(existingRateNames, newName, currentName)) {
        return;
    }

    updatePolicyDistanceRateName(policyID, customUnit, [{...rate, name: sanitized}]);
}

/**
 * Updates a distance rate amount from an inline table edit. Delegates to the canonical rate
 * action. Silently no-ops when the amount is unchanged or fails validation (matching the Spend
 * inline-edit behavior, where an invalid edit reverts to the original value without an error).
 */
function updateDistanceRateValueInline(policyID: string, customUnit: CustomUnit, rate: Rate, newRate: string, toLocaleDigit: (arg: string) => string): void {
    if (getDistanceRateValueError(newRate, toLocaleDigit)) {
        return;
    }

    const currentRateValue = (parseFloat((rate.rate ?? 0).toString()) / CONST.POLICY.CUSTOM_UNIT_RATE_BASE_OFFSET).toFixed(CONST.MAX_TAX_RATE_DECIMAL_PLACES);
    if (Number(newRate).toFixed(CONST.MAX_TAX_RATE_DECIMAL_PLACES) === currentRateValue) {
        return;
    }

    updatePolicyDistanceRateValue(policyID, customUnit, [{...rate, rate: Number(newRate) * CONST.POLICY.CUSTOM_UNIT_RATE_BASE_OFFSET}]);
}

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

function isCardLimitType(limitType: string): limitType is CardLimitType {
    switch (limitType) {
        case CONST.EXPENSIFY_CARD.LIMIT_TYPES.SMART:
        case CONST.EXPENSIFY_CARD.LIMIT_TYPES.MONTHLY:
        case CONST.EXPENSIFY_CARD.LIMIT_TYPES.FIXED:
        case CONST.EXPENSIFY_CARD.LIMIT_TYPES.SINGLE_USE:
            return true;
        default:
            return false;
    }
}

/**
 * Changes an Expensify card's limit type from an inline table edit. Delegates to the canonical
 * limit type action, which owns the optimistic Onyx write, the API call, and failure rollback.
 * Dates are left unchanged. Silently no-ops when the type is unchanged, unknown, or not valid
 * for the card (matching the Spend inline-edit behavior).
 */
function updateExpensifyCardLimitTypeInline(workspaceAccountID: number, card: Card, newLimitType: string): void {
    const currentLimitType = card.nameValuePairs?.limitType;
    if (newLimitType === currentLimitType || !isCardLimitType(newLimitType)) {
        return;
    }

    if (newLimitType === CONST.EXPENSIFY_CARD.LIMIT_TYPES.SINGLE_USE && !card.nameValuePairs?.isVirtual) {
        return;
    }

    if (newLimitType === CONST.EXPENSIFY_CARD.LIMIT_TYPES.FIXED && !shouldShowExpensifyCardFixedLimitType(card)) {
        return;
    }

    updateExpensifyCardLimitType(workspaceAccountID, card.cardID, newLimitType, undefined, card.nameValuePairs);
}

/**
 * Updates an Expensify card limit from an inline table edit. `newLimit` is the dollar
 * amount as a string. Silently no-ops when the amount is unchanged or fails validation,
 * matching the Spend inline-edit behavior.
 */
function updateExpensifyCardLimitInline(workspaceAccountID: number, card: Card, newLimit: string): void {
    if (getExpensifyCardLimitError(newLimit)) {
        return;
    }

    const nextLimit = Number(newLimit) * 100;
    const oldLimit = card.nameValuePairs?.unapprovedExpenseLimit ?? 0;
    if (nextLimit === oldLimit) {
        return;
    }

    updateExpensifyCardLimit(workspaceAccountID, card.cardID, nextLimit, getExpensifyCardNewAvailableSpend(card, nextLimit), oldLimit, card.availableSpend, card.nameValuePairs?.isVirtual);
}

export {
    renameCategoryInline,
    renameTagInline,
    renameCompanyCardInline,
    renameExpensifyCardInline,
    renameDistanceRateInline,
    updateDistanceRateValueInline,
    updateMemberRoleInline,
    updateExpensifyCardLimitTypeInline,
    updateExpensifyCardLimitInline,
};
