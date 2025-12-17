import {useCallback, useMemo} from 'react';
import type {TupleToUnion} from 'type-fest';
import CONST from '@src/CONST';
import type {TransactionViolation, ViolationName} from '@src/types/onyx';

/**
 * Names of Fields where violations can occur.
 */
const validationFields = ['amount', 'billable', 'category', 'comment', 'date', 'merchant', 'receipt', 'tag', 'tax', 'attendees', 'customUnitRateID', 'none'] as const;

type ViolationField = TupleToUnion<typeof validationFields>;

/**
 * Map from Violation Names to the field where that violation can occur.
 */
const violationNameToField: Record<ViolationName, (violation: TransactionViolation) => ViolationField> = {
    allTagLevelsRequired: () => 'tag',
    autoReportedRejectedExpense: () => 'merchant',
    billableExpense: () => 'billable',
    cashExpenseWithNoReceipt: () => 'receipt',
    categoryOutOfPolicy: () => 'category',
    conversionSurcharge: () => 'amount',
    customUnitOutOfPolicy: () => 'customUnitRateID',
    duplicatedTransaction: () => 'merchant',
    fieldRequired: () => 'merchant',
    futureDate: () => 'date',
    invoiceMarkup: () => 'amount',
    maxAge: () => 'date',
    missingCategory: () => 'category',
    missingComment: () => 'comment',
    missingAttendees: () => 'attendees',
    missingTag: () => 'tag',
    modifiedAmount: () => 'amount',
    modifiedDate: () => 'date',
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
    customRules: (violation) => {
        if (!violation?.data?.field) {
            return 'receipt';
        }

        const field = violation.data.field as ViolationField;
        return validationFields.includes(field) ? field : 'receipt';
    },
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
};

type ViolationsMap = Map<ViolationField, TransactionViolation[]>;

/**
 * @param violations – List of transaction violations
 * @param shouldShowOnlyViolations – Whether we should only show violations of type 'violation'
 */
function useViolations(violations: TransactionViolation[], shouldShowOnlyViolations: boolean) {
    const violationsByField = useMemo((): ViolationsMap => {
        const filteredViolations = violations.filter((violation) => {
            if (shouldShowOnlyViolations) {
                return violation.type === CONST.VIOLATION_TYPES.VIOLATION;
            }
            return true;
        });

        const violationGroups = new Map<ViolationField, TransactionViolation[]>();
        for (const violation of filteredViolations) {
            const field = violationNameToField[violation.name]?.(violation);
            const existingViolations = violationGroups.get(field) ?? [];
            violationGroups.set(field, [...existingViolations, violation]);
        }
        return violationGroups ?? new Map();
    }, [violations, shouldShowOnlyViolations]);

    const getViolationsForField = useCallback(
        (field: ViolationField, data?: TransactionViolation['data'], policyHasDependentTags = false, tagValue?: string) => {
            const currentViolations = violationsByField.get(field) ?? [];
            const firstViolation = currentViolations.at(0);

            // someTagLevelsRequired has special logic because data.errorIndexes is a bit unique in how it denotes the tag list that has the violation
            // tagListIndex can be 0 so we compare with undefined
            if (firstViolation?.name === CONST.VIOLATIONS.SOME_TAG_LEVELS_REQUIRED && data?.tagListIndex !== undefined && Array.isArray(firstViolation?.data?.errorIndexes)) {
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

            // missingTag has special logic for policies with dependent tags, because only one violation is returned for all tags
            // when no tags are present, so the tag name isn't set in the violation data. That's why we add it here
            if (policyHasDependentTags && firstViolation?.name === CONST.VIOLATIONS.MISSING_TAG && data?.tagListName) {
                return [
                    {
                        ...firstViolation,
                        data: {
                            ...firstViolation.data,
                            tagName: data?.tagListName,
                        },
                    },
                ];
            }

            // tagOutOfPolicy has special logic because we have to account for multi-level tags and use tagName to find the right tag to put the violation on
            if (firstViolation?.name === CONST.VIOLATIONS.TAG_OUT_OF_POLICY && data?.tagListName !== undefined && firstViolation?.data?.tagName) {
                return currentViolations.filter((violation) => violation.data?.tagName === data?.tagListName);
            }

            // allTagLevelsRequired has special logic because it is returned when one but not all the tags are set,
            // so we need to return the violation for the tag fields without a tag set
            if (firstViolation?.name === CONST.VIOLATIONS.ALL_TAG_LEVELS_REQUIRED && tagValue) {
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
