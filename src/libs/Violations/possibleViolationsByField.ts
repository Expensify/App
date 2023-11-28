import invertBy from 'lodash/invertBy';
import {ViolationName} from '@src/types/onyx';

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

/**
 * Map from field name to array of violation types that can occur on that field.
 * @example
 * {
 *   // ...
 *   category: ['missingCategory', 'categoryOutOfPolicy']
 *   // ...
 * }
 */
const possibleViolationsByField = invertBy(violationFields) as Record<ViolationField, ViolationName[]>;

export default possibleViolationsByField;
export type {ViolationField};
