import {useCallback, useMemo} from 'react';
import useLocalize from '@hooks/useLocalize';
import {TransactionViolation, ViolationName} from '@src/types/onyx';

/**
 * Map from Violation Names to the field where that violation can occur
 */
const violationFields: Record<ViolationName, ViolationField> = {
    perDayLimit: 'amount',
    maxAge: 'date',
    overLimit: 'amount',
    overLimitAttendee: 'amount',
    overCategoryLimit: 'amount',
    receiptRequired: 'receipt',
    missingCategory: 'category',
    categoryOutOfPolicy: 'category',
    missingTag: 'tag',
    tagOutOfPolicy: 'tag',
    missingComment: 'comment',
    taxRequired: 'tax',
    taxOutOfPolicy: 'tax',
    billableExpense: 'billable',
};

/**
 * Names of Fields where violations can occur
 */
type ViolationField = 'merchant' | 'amount' | 'category' | 'date' | 'tag' | 'comment' | 'billable' | 'receipt' | 'tax';

type ViolationsMap = Map<ViolationField, TransactionViolation[]>;

export default function useViolations(violations: TransactionViolation[]) {
    const {translate} = useLocalize();

    // First we group violations by field and memoize the result
    const violationsByField = useMemo((): ViolationsMap => {
        const violationGroups = new Map<ViolationField, TransactionViolation[]>();

        for (const violation of violations) {
            const field = violationFields[violation.name];
            const existingViolations = violationGroups.get(field) ?? [];
            existingViolations.push(violation);
            violationGroups.set(field, existingViolations);
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

    const getViolationsForField = useCallback(
        (field: ViolationField) => {
            const fieldViolations: TransactionViolation[] = violationsByField.get(field) ?? [];
            return fieldViolations.map((violation) => translate(`violations.${violation.name}`));
        },
        [translate, violationsByField],
    );

    return {
        hasViolations,
        getViolationsForField,
    };
}
