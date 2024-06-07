import {useCallback, useMemo} from 'react';
import CONST from '@src/CONST';
import type {TransactionViolation, ViolationName} from '@src/types/onyx';

/**
 * Names of Fields where violations can occur.
 */
type ViolationField = 'amount' | 'billable' | 'category' | 'comment' | 'date' | 'merchant' | 'receipt' | 'tag' | 'tax' | 'none';

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
    hold: 'none',
};

type ViolationsMap = Map<ViolationField, TransactionViolation[]>;

function useViolations(violations: TransactionViolation[]) {
    const violationsByField = useMemo((): ViolationsMap => {
        const filteredViolations = violations.filter((violation) => violation.type === CONST.VIOLATION_TYPES.VIOLATION);
        const violationGroups = new Map<ViolationField, TransactionViolation[]>();
        for (const violation of filteredViolations) {
            const field = violationFields[violation.name];
            const existingViolations = violationGroups.get(field) ?? [];
            violationGroups.set(field, [...existingViolations, violation]);
        }
        return violationGroups ?? new Map();
    }, [violations]);

    const getViolationsForField = useCallback(
        (field: ViolationField, data?: TransactionViolation['data']) => {
            const currentViolations = violationsByField.get(field) ?? [];

            // someTagLevelsRequired has special logic becase data.errorIndexes is a bit unique in how it denotes the tag list that has the violation
            // tagListIndex can be 0 so we compare with undefined
            if (currentViolations[0]?.name === 'someTagLevelsRequired' && data?.tagListIndex !== undefined && Array.isArray(currentViolations[0]?.data?.errorIndexes)) {
                return currentViolations
                    .filter((violation) => violation.data?.errorIndexes?.includes(data?.tagListIndex ?? -1))
                    .map((violation) => ({
                        ...violation,
                        data: {
                            ...violation.data,
                            tagName: data?.tagListName,
                        },
                    }));
            }

            // tagOutOfPolicy has special logic because we have to account for multi-level tags and use tagName to find the right tag to put the violation on
            if (currentViolations[0]?.name === 'tagOutOfPolicy' && data?.tagListName !== undefined && currentViolations[0]?.data?.tagName) {
                return currentViolations.filter((violation) => violation.data?.tagName === data?.tagListName);
            }

            return currentViolations;
        },
        [violationsByField],
    );

    return {
        getViolationsForField,
    };
}

export default useViolations;
export type {ViolationField};
