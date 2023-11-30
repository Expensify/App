import {useCallback, useMemo} from 'react';
import {TransactionViolation, ViolationName} from '@src/types/onyx';

/**
 * Map from Violation Names to the field where that violation can occur
 */
const violationFields: Record<ViolationName, ViolationField> = {
    allTagLevelsRequired: 'tag',
    autoReportedRejectedExpense: 'merchant',
    billableExpense: 'billable',
    cashExpenseWithNoReceipt: 'receipt',
    categoryOutOfPolicy: 'category',
    conversionSurcharge: 'amount',
    customUnitOutOfPolicy: 'merchant',
    duplicatedTransaction: 'merchant',
    fieldRequired: 'merchant',
    futureDate: 'date',
    invoiceMarkup: 'amount',
    maxAge: 'date',
    missingCategory: 'category',
    missingComment: 'comment',
    missingTag: 'tag',
    modifiedAmount: 'amount',
    modifiedDate: 'date',
    nonExpensiworksExpense: 'merchant',
    overAutoApprovalLimit: 'amount',
    overCategoryLimit: 'amount',
    overLimit: 'amount',
    overLimitAttendee: 'amount',
    perDayLimit: 'amount',
    receiptNotSmartScanned: 'receipt',
    receiptRequired: 'receipt',
    rter: 'merchant',
    smartscanFailed: 'receipt',
    someTagLevelsRequired: 'tag',
    tagOutOfPolicy: 'tag',
    taxAmountChanged: 'tax',
    taxOutOfPolicy: 'tax',
    taxRateChanged: 'tax',
    taxRequired: 'tax',
};

/**
 * Names of fields where violations can occur
 */
type ViolationField = 'amount' | 'billable' | 'category' | 'comment' | 'date' | 'merchant' | 'receipt' | 'tag' | 'tax';

type ViolationsMap = Map<ViolationField, TransactionViolation[]>;
type HasViolationsMap = Map<ViolationField, boolean>;

function useViolations(violations: TransactionViolation[]) {
    const {violationsByField, hasViolationsByField} = useMemo((): {violationsByField: ViolationsMap; hasViolationsByField: HasViolationsMap} => {
        const violationGroups = new Map<ViolationField, TransactionViolation[]>();
        const hasViolationsMap = new Map<ViolationField, boolean>();

        for (const violation of violations) {
            const field = violationFields[violation.name];
            const existingViolations = violationGroups.get(field) ?? [];
            violationGroups.set(field, [...existingViolations, violation]);
            hasViolationsMap.set(field, true);
        }

        return {violationsByField: violationGroups, hasViolationsByField: hasViolationsMap};
    }, [violations]);

    const hasViolations = useCallback((field: ViolationField) => Boolean(hasViolationsByField.get(field)), [hasViolationsByField]);

    const getViolationsForField = useCallback((field: ViolationField) => violationsByField.get(field) ?? [], [violationsByField]);

    return {
        hasViolations,
        getViolationsForField,
    };
}

export {useViolations, violationFields};
