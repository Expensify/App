import {isHardViolationOrRateDateWarning} from '@libs/Violations/ViolationsUtils';

import CONST from '@src/CONST';
import type {TransactionViolation, ViolationName} from '@src/types/onyx';

import type {TupleToUnion} from 'type-fest';

/**
 * Names of Fields where violations can occur.
 */
const validationFields = [
    'amount',
    'billable',
    'category',
    'comment',
    'date',
    'merchant',
    'receipt',
    'reimbursable',
    'tag',
    'tax',
    'attendees',
    'customUnitRateID',
    'vendor',
    'waypoints',
    'none',
] as const;

type ViolationField = TupleToUnion<typeof validationFields>;

/**
 * Map from Violation Names to the field where that violation can occur.
 */
const violationNameToField: Record<ViolationName, (violation: TransactionViolation) => ViolationField> = {
    allTagLevelsRequired: () => 'tag',
    autoReportedRejectedExpense: () => 'merchant',
    billableExpense: () => 'billable',
    cashExpenseWithNoReceipt: () => 'receipt',
    categoryNotAllowed: () => 'category',
    categoryOutOfPolicy: () => 'category',
    conversionSurcharge: () => 'amount',
    customUnitOutOfPolicy: () => 'customUnitRateID',
    customUnitRateOutOfDateRange: () => 'customUnitRateID',
    duplicatedTransaction: () => 'merchant',
    fieldRequired: () => 'merchant',
    futureDate: () => 'date',
    inactiveVendor: () => 'vendor',
    invoiceMarkup: () => 'amount',
    maxAge: () => 'date',
    missingCategory: () => 'category',
    missingComment: () => 'comment',
    missingAttendees: () => 'attendees',
    missingTag: () => 'tag',
    nonDefaultAmount: () => 'amount',
    nonDefaultBillable: () => 'billable',
    nonDefaultCategory: () => 'category',
    nonDefaultComment: () => 'comment',
    nonDefaultMerchant: () => 'merchant',
    nonDefaultReimbursable: () => 'reimbursable',
    nonDefaultTag: () => 'tag',
    nonDefaultTax: () => 'tax',
    nonDefaultVendor: () => 'vendor',
    modifiedAmount: () => 'amount',
    modifiedDate: () => 'date',
    increasedDistance: () => 'waypoints',
    nonExpensiworksExpense: () => 'merchant',
    overAutoApprovalLimit: () => 'amount',
    overCategoryLimit: () => 'amount',
    overLimit: () => 'amount',
    overTripLimit: () => 'amount',
    overLimitAttendee: () => 'amount',
    perDayLimit: () => 'amount',
    prohibitedExpense: () => 'receipt',
    receiptNotSmartScanned: () => 'receipt',
    receiptRequired: () => 'receipt',
    itemizedReceiptRequired: () => 'receipt',
    customRules: (violation) => {
        if (!violation?.data?.field) {
            return 'receipt';
        }

        const field = violation.data.field as ViolationField;
        return validationFields.includes(field) ? field : 'receipt';
    },
    ruleViolation: () => 'none',
    rter: () => 'merchant',
    smartscanFailed: () => 'receipt',
    someTagLevelsRequired: () => 'tag',
    tagOutOfPolicy: () => 'tag',
    taxRateChanged: () => 'tax',
    taxAmountChanged: () => 'tax',
    taxOutOfPolicy: () => 'tax',
    taxRequired: () => 'tax',
    hold: () => 'none',
    receiptGeneratedWithAI: () => 'receipt',
    companyCardRequired: () => 'none',
    noRoute: () => 'waypoints',
};

type ViolationsMap = Map<ViolationField, TransactionViolation[]>;

/**
 * @param violations – List of transaction violations
 * @param shouldShowOnlyViolations – Whether we should only show violations of type 'violation'
 */
function useViolations(violations: TransactionViolation[], shouldShowOnlyViolations: boolean) {
    // React Compiler skips hooks that call no other hooks, so opt in to keep getViolationsForField stable across renders.
    'use memo';

    const filteredViolations = violations.filter((violation) => {
        if (shouldShowOnlyViolations) {
            return isHardViolationOrRateDateWarning(violation);
        }
        return true;
    });
    const violationGroups = new Map<ViolationField, TransactionViolation[]>();
    for (const violation of filteredViolations) {
        const field = violationNameToField[violation.name]?.(violation);
        const existingViolations = violationGroups.get(field) ?? [];
        violationGroups.set(field, [...existingViolations, violation]);
    }
    const violationsByField: ViolationsMap = violationGroups;

    const getViolationsForField = (field: ViolationField, data?: TransactionViolation['data'], policyHasDependentTags = false, tagValue?: string) => {
        const currentViolations = violationsByField.get(field) ?? [];

        // Since tag levels can have different violations, we need to further filter those. If the violation isn't for multi-level tags, we can just return the violations
        if (field !== 'tag' || (data?.tagListIndex === undefined && data?.tagListName === undefined && !tagValue)) {
            return currentViolations;
        }

        return currentViolations.flatMap((violation) => {
            if (violation.name === CONST.VIOLATIONS.SOME_TAG_LEVELS_REQUIRED && data?.tagListIndex !== undefined && Array.isArray(violation.data?.errorIndexes)) {
                return violation.data.errorIndexes.includes(data.tagListIndex) ? [{...violation, data: {...violation.data, tagName: data.tagListName}}] : [];
            }

            if (violation.name === CONST.VIOLATIONS.NONDEFAULT_TAG && violation.data?.tagListIndex !== undefined && data?.tagListIndex !== undefined) {
                return violation.data.tagListIndex === data.tagListIndex ? [violation] : [];
            }

            if (violation.name === CONST.VIOLATIONS.MISSING_TAG) {
                // A named missing tag belongs only to its row
                if (data?.tagListName && violation.data?.tagName && violation.data.tagName !== data.tagListName) {
                    return [];
                }

                // An unnamed missing tag applies to each dependent row
                if (policyHasDependentTags && data?.tagListName && !violation.data?.tagName) {
                    return [{...violation, data: {...violation.data, tagName: data.tagListName}}];
                }
            }

            if (violation.name === CONST.VIOLATIONS.TAG_OUT_OF_POLICY && data?.tagListName !== undefined && violation.data?.tagName && violation.data.tagName !== data.tagListName) {
                return [];
            }

            // A filled row should show this error only when the violation names that row
            if (violation.name === CONST.VIOLATIONS.ALL_TAG_LEVELS_REQUIRED && tagValue && violation.data?.tagName !== data?.tagListName) {
                return [];
            }

            return [violation];
        });
    };

    return {getViolationsForField};
}

export default useViolations;
export type {ViolationField};
