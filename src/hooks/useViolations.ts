import {useCallback, useMemo} from 'react';
import {TransactionViolation, ViolationName} from '@src/types/onyx';

/**
 * Names of Fields where violations can occur
 */
type ViolationField = 'amount' | 'billable' | 'category' | 'comment' | 'date' | 'merchant' | 'receipt' | 'tag' | 'tax';

/**
 * Map from Violation Names to the field where that violation can occur.
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

type ViolationsMap = Map<ViolationField, TransactionViolation[]>;

/**
 * Hook to access violations for a transaction. Returns `getViolationsForField()`
 * @example const {getViolationsForField} = useViolations(transactionViolations);
 * @param violations - Array of {@link TransactionViolation}s
 * @returns - Object with `getViolationsForField()` callback
 */
function useViolations(violations: TransactionViolation[]) {
    const violationsByField = useMemo((): ViolationsMap => {
        const violationGroups = new Map<ViolationField, TransactionViolation[]>();

        for (const violation of violations ?? []) {
            const field = violationFields[violation.name];
            const existingViolations = violationGroups.get(field) ?? [];
            violationGroups.set(field, [...existingViolations, violation]);
        }

        return violationGroups ?? new Map();
    }, [violations]);

    /**
     * Callback that filters the list of {@link TransactionViolation}s provided to the hook,
     * and returns only those that apply to the given {@link ViolationField}.
     * (return value memoized to prevent re-renders)
     * @example const violations = getViolationsForField('amount');
     * @param field - ViolationField to get violations for (e.g. 'amount', 'billable', 'category',
     *     etc.)
     */
    const getViolationsForField = useCallback((field: ViolationField) => violationsByField.get(field) ?? [], [violationsByField]);

    return {
        getViolationsForField,
    };
}

export default useViolations;
export type {ViolationField};
