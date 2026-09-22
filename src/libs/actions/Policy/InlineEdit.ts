/**
 * Validate-and-delegate helpers for inline edits on workspace settings tables.
 * Table pages call these instead of the canonical Policy/Card actions so sanitization
 * and no-op checks stay in one place. Persistence and rollback stay in those actions.
 */
import type PolicyData from '@hooks/usePolicyData/types';

import {getCardNameError, getExpensifyCardLimitError, getExpensifyCardNewAvailableSpend, shouldShowExpensifyCardFixedLimitType} from '@libs/CardUtils';
import {getCategoryNameError, getDecodedCategoryName} from '@libs/CategoryUtils';
import {convertToBackendAmount} from '@libs/CurrencyUtils';
import {getDistanceRateNameError, getDistanceRateValueError} from '@libs/PolicyDistanceRatesUtils';
import {getPerDiemAmountError, getPerDiemNameError} from '@libs/PolicyPerDiemUtils';
import {getCleanedTagName, getTagList} from '@libs/PolicyUtils';
import StringUtils from '@libs/StringUtils';
import {getTagNameError} from '@libs/TagUtils';

import {updateExpensifyCardLimit, updateExpensifyCardLimitType, updateExpensifyCardTitle} from '@userActions/Card';
import {updateCompanyCardName} from '@userActions/CompanyCards';

import CONST from '@src/CONST';
import type {Card, Policy} from '@src/types/onyx';
import type {CardLimitType} from '@src/types/onyx/Card';
import type {CompanyCardFeedWithNumber} from '@src/types/onyx/CardFeeds';
import type {CustomUnit, Rate} from '@src/types/onyx/Policy';

import type {OnyxEntry} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';

import {renamePolicyCategory} from './Category';
import {updatePolicyDistanceRateName, updatePolicyDistanceRateValue} from './DistanceRate';
import {updateWorkspaceMembersRole} from './Member';
import {editPerDiemRateAmount, editPerDiemRateDestination, editPerDiemRateSubrate} from './PerDiem';
import {renamePolicyTag} from './Tag';

function renameCategoryInline(policyData: PolicyData, currentName: string, newName: string, isVendorMatchingBetaEnabled: boolean | undefined): void {
    const sanitized = StringUtils.sanitizeName(newName);
    const currentDisplayName = getDecodedCategoryName(currentName);

    if (sanitized === currentDisplayName || getCategoryNameError(policyData.categories, newName, currentDisplayName)) {
        return;
    }

    renamePolicyCategory(policyData, {oldName: currentName, newName: sanitized}, isVendorMatchingBetaEnabled);
}

function renameTagInline(policyData: PolicyData, oldName: string, newName: string, isVendorMatchingBetaEnabled: boolean | undefined): void {
    const sanitized = StringUtils.sanitizeName(newName);
    const currentDisplayName = getCleanedTagName(oldName);
    const {tags} = getTagList(policyData.tags, 0);

    if (sanitized === currentDisplayName || getTagNameError(tags, newName, currentDisplayName)) {
        return;
    }

    renamePolicyTag(policyData, {oldName, newName: sanitized}, 0, isVendorMatchingBetaEnabled);
}

function renameCompanyCardInline(domainOrWorkspaceAccountID: number, cardID: string, newName: string, bankName: CompanyCardFeedWithNumber, displayedName: string, storedName?: string): void {
    const sanitized = StringUtils.sanitizeName(newName);

    if (sanitized === displayedName || getCardNameError(newName)) {
        return;
    }

    updateCompanyCardName(domainOrWorkspaceAccountID, cardID, sanitized, bankName, storedName);
}

function renameExpensifyCardInline(workspaceAccountID: number, cardID: number, newName: string, currentName: string): void {
    const sanitized = StringUtils.sanitizeName(newName);

    if (sanitized === currentName || getCardNameError(newName)) {
        return;
    }

    updateExpensifyCardTitle(workspaceAccountID, cardID, sanitized, currentName);
}

function renameDistanceRateInline(policyID: string, customUnit: CustomUnit, rate: Rate, newName: string): void {
    const sanitized = StringUtils.sanitizeName(newName);
    const currentName = rate.name ?? '';
    const existingRateNames = Object.values(customUnit.rates ?? {}).map((existingRate) => existingRate.name ?? '');

    if (sanitized === currentName || getDistanceRateNameError(existingRateNames, newName, currentName)) {
        return;
    }

    updatePolicyDistanceRateName(policyID, customUnit, [{...rate, name: sanitized}]);
}

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

function updateMemberRoleInline(policy: OnyxEntry<Policy>, memberLogin: string, accountID: number, currentRole: string | undefined, newRole: ValueOf<typeof CONST.POLICY.ROLE>): void {
    if (!memberLogin || newRole === currentRole) {
        return;
    }

    updateWorkspaceMembersRole(policy, [memberLogin], [accountID], newRole);
}

/**
 * Whether an inline limit-type edit is persistable. The table page uses this to skip the confirm
 * modal for types the write path would no-op (unchanged, Single Use on physical, or Fixed when hidden).
 */
function canUpdateExpensifyCardLimitTypeInline(card: Card, newLimitType: CardLimitType, fallbackLimitType?: CardLimitType): boolean {
    if (newLimitType === card.nameValuePairs?.limitType) {
        return false;
    }

    if (newLimitType === CONST.EXPENSIFY_CARD.LIMIT_TYPES.SINGLE_USE && !card.nameValuePairs?.isVirtual) {
        return false;
    }

    return newLimitType !== CONST.EXPENSIFY_CARD.LIMIT_TYPES.FIXED || shouldShowExpensifyCardFixedLimitType(card, fallbackLimitType);
}

function updateExpensifyCardLimitTypeInline(workspaceAccountID: number, card: Card, newLimitType: CardLimitType, fallbackLimitType?: CardLimitType): void {
    if (!canUpdateExpensifyCardLimitTypeInline(card, newLimitType, fallbackLimitType)) {
        return;
    }

    // Leave existing validity dates unchanged. Stored dates are UTC timestamps, not picker strings.
    updateExpensifyCardLimitType({
        workspaceAccountID,
        cardID: card.cardID,
        newLimitType,
        oldCardNameValuePairs: card.nameValuePairs,
        shouldSkipValidityDateUpdate: true,
    });
}

/**
 * Cents to persist from an inline dollar-string edit, or undefined when the value is invalid or unchanged.
 * The table page uses this to skip the confirm modal; the write path uses the same result so both stay in sync.
 */
function getExpensifyCardLimitInlineUpdate(card: Card, newLimit: string): number | undefined {
    if (getExpensifyCardLimitError(newLimit)) {
        return;
    }

    const nextLimit = convertToBackendAmount(Number(newLimit));
    if (nextLimit === (card.nameValuePairs?.unapprovedExpenseLimit ?? 0)) {
        return;
    }

    return nextLimit;
}

/**
 * Updates an Expensify card limit from an inline table edit. `newLimit` is the dollar amount as a string.
 */
function updateExpensifyCardLimitInline(workspaceAccountID: number, card: Card, newLimit: string): void {
    const nextLimit = getExpensifyCardLimitInlineUpdate(card, newLimit);
    if (nextLimit === undefined) {
        return;
    }

    updateExpensifyCardLimit(
        workspaceAccountID,
        card.cardID,
        nextLimit,
        getExpensifyCardNewAvailableSpend(card, nextLimit),
        card.nameValuePairs?.unapprovedExpenseLimit ?? 0,
        card.availableSpend,
        card.nameValuePairs?.isVirtual,
    );
}

function renamePerDiemDestinationInline(policyID: string, rateID: string, customUnit: CustomUnit | undefined, currentName: string, newName: string): void {
    const sanitized = StringUtils.sanitizeName(newName);

    if (sanitized === currentName || getPerDiemNameError(newName)) {
        return;
    }

    editPerDiemRateDestination(policyID, rateID, customUnit, sanitized);
}

function renamePerDiemSubrateInline(policyID: string, rateID: string, subRateID: string, customUnit: CustomUnit | undefined, currentName: string, newName: string): void {
    const sanitized = StringUtils.sanitizeName(newName);

    if (sanitized === currentName || getPerDiemNameError(newName)) {
        return;
    }

    editPerDiemRateSubrate(policyID, rateID, subRateID, customUnit, sanitized);
}

/**
 * Updates a per diem amount from an inline table edit. `newAmount` is the frontend dollar string.
 */
function updatePerDiemAmountInline(policyID: string, rateID: string, subRateID: string, customUnit: CustomUnit | undefined, currentRate: number, newAmount: string): void {
    if (getPerDiemAmountError(newAmount)) {
        return;
    }

    const backendAmount = convertToBackendAmount(Number(newAmount));
    if (backendAmount === currentRate) {
        return;
    }

    editPerDiemRateAmount(policyID, rateID, subRateID, customUnit, backendAmount);
}

export {
    renameCategoryInline,
    renameTagInline,
    renameCompanyCardInline,
    renameExpensifyCardInline,
    renameDistanceRateInline,
    updateDistanceRateValueInline,
    updateMemberRoleInline,
    canUpdateExpensifyCardLimitTypeInline,
    getExpensifyCardLimitInlineUpdate,
    updateExpensifyCardLimitTypeInline,
    updateExpensifyCardLimitInline,
    renamePerDiemDestinationInline,
    renamePerDiemSubrateInline,
    updatePerDiemAmountInline,
};
