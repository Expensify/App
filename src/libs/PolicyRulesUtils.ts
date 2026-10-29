import CONST from '@src/CONST';
import type {PolicyCategory} from '@src/types/onyx';
import type {PendingAction} from '@src/types/onyx/OnyxCommon';

function isPendingDeleteOrUpdate(pendingAction: PendingAction | undefined): boolean {
    return pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE || pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE;
}

function getMccGroupDisplayName(groupID: string): string {
    return groupID.charAt(0).toUpperCase() + groupID.slice(1);
}

function isWaiveReceiptThreshold(value: number | null | undefined): boolean {
    return value === CONST.DISABLED_MAX_EXPENSE_VALUE;
}

function hasExplicitReceiptThreshold(value: number | null | undefined): value is number {
    return value !== null && value !== undefined && value !== CONST.DISABLED_MAX_EXPENSE_VALUE;
}

function hasCategoryReceiptOverride(value: number | null | undefined): boolean {
    return value !== null && value !== undefined;
}

type RequireFieldsPendingFieldKey = 'areCommentsRequired' | 'areAttendeesRequired' | 'maxAmountNoReceipt' | 'maxAmountNoItemizedReceipt';

function isRequireFieldsFieldPendingDelete(category: PolicyCategory, field: RequireFieldsPendingFieldKey): boolean {
    return category.pendingFields?.[field] === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE;
}

function isDescriptionRequiredForCategory(category: PolicyCategory, shouldIncludePendingDeleteFields = false): boolean {
    return !!category.areCommentsRequired && (shouldIncludePendingDeleteFields || !isRequireFieldsFieldPendingDelete(category, 'areCommentsRequired'));
}

function isAttendeesRequiredForCategory(category: PolicyCategory, shouldIncludePendingDeleteFields = false): boolean {
    return !!category.areAttendeesRequired && (shouldIncludePendingDeleteFields || !isRequireFieldsFieldPendingDelete(category, 'areAttendeesRequired'));
}

function isReceiptRequireOverrideForCategory(category: PolicyCategory, shouldIncludePendingDeleteFields = false): boolean {
    return (
        hasCategoryReceiptOverride(category.maxAmountNoReceipt) &&
        hasExplicitReceiptThreshold(category.maxAmountNoReceipt) &&
        (shouldIncludePendingDeleteFields || !isRequireFieldsFieldPendingDelete(category, 'maxAmountNoReceipt'))
    );
}

function isItemizedReceiptRequireOverrideForCategory(category: PolicyCategory, shouldIncludePendingDeleteFields = false): boolean {
    return (
        hasCategoryReceiptOverride(category.maxAmountNoItemizedReceipt) &&
        hasExplicitReceiptThreshold(category.maxAmountNoItemizedReceipt) &&
        (shouldIncludePendingDeleteFields || !isRequireFieldsFieldPendingDelete(category, 'maxAmountNoItemizedReceipt'))
    );
}

function isReceiptWaivedForCategory(category: PolicyCategory, shouldIncludePendingDeleteFields = false): boolean {
    return isWaiveReceiptThreshold(category.maxAmountNoReceipt) && (shouldIncludePendingDeleteFields || !isRequireFieldsFieldPendingDelete(category, 'maxAmountNoReceipt'));
}

function isItemizedReceiptWaivedForCategory(category: PolicyCategory, shouldIncludePendingDeleteFields = false): boolean {
    return isWaiveReceiptThreshold(category.maxAmountNoItemizedReceipt) && (shouldIncludePendingDeleteFields || !isRequireFieldsFieldPendingDelete(category, 'maxAmountNoItemizedReceipt'));
}

function categoryHasAnyRequireFieldsRule(category: PolicyCategory): boolean {
    return (
        isDescriptionRequiredForCategory(category) ||
        isAttendeesRequiredForCategory(category) ||
        isReceiptRequireOverrideForCategory(category) ||
        isItemizedReceiptRequireOverrideForCategory(category) ||
        isReceiptWaivedForCategory(category) ||
        isItemizedReceiptWaivedForCategory(category)
    );
}

function hasExplicitFlagAmount(maxExpenseAmount: number | null | undefined): maxExpenseAmount is number {
    return maxExpenseAmount !== null && maxExpenseAmount !== undefined && maxExpenseAmount !== CONST.DISABLED_MAX_EXPENSE_VALUE;
}

export {
    getMccGroupDisplayName,
    isPendingDeleteOrUpdate,
    hasExplicitFlagAmount,
    isWaiveReceiptThreshold,
    hasExplicitReceiptThreshold,
    isDescriptionRequiredForCategory,
    isAttendeesRequiredForCategory,
    isReceiptRequireOverrideForCategory,
    isItemizedReceiptRequireOverrideForCategory,
    isReceiptWaivedForCategory,
    isItemizedReceiptWaivedForCategory,
    categoryHasAnyRequireFieldsRule,
};

export type {RequireFieldsPendingFieldKey};
