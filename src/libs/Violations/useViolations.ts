import {useCallback, useMemo} from 'react';
import {TransactionViolation, ViolationName} from '@src/types/onyx';

/**
 * Map from Violation Names to the field where that violation can occur
 */
const violationFields: Record<ViolationName, ViolationField> = {
    allTagLevelsRequired: 'tag',
    autoReportedRejectedExpense: 'amount',
    billableExpense: 'billable',
    cashExpenseWithNoReceipt: 'receipt',
    categoryOutOfPolicy: 'category',
    conversionSurcharge: 'amount',
    customUnitOutOfPolicy: 'amount',
    duplicatedTransaction: 'merchant',
    fieldRequired: 'category',
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
 * Names of Fields where violations can occur
 */
type ViolationField = 'amount' | 'billable' | 'category' | 'comment' | 'date' | 'merchant' | 'receipt' | 'tag' | 'tax';

type ViolationsMap = Map<ViolationField, TransactionViolation[]>;

function useViolations(violations: TransactionViolation[]) {
    const violationsByField = useMemo((): ViolationsMap => {
        const violationGroups = new Map<ViolationField, TransactionViolation[]>();

        for (const violation of violations) {
            const field = violationFields[violation.name];
            const existingViolations = violationGroups.get(field) ?? [];
            violationGroups.set(field, [...existingViolations, violation]);
        }

        return violationGroups;
    }, [violations]);

    const hasViolations = useCallback(
        (field: ViolationField) => {
            const fieldViolations: TransactionViolation[] = violationsByField.get(field) ?? [];
            return Boolean(fieldViolations.length > 0);
        },
        [violationsByField],
    );

    const getViolationsForField = useCallback((field: ViolationField) => violationsByField.get(field) ?? [], [violationsByField]);

    return {
        hasViolations,
        getViolationsForField,
    };
}

export {useViolations, violationFields};
