/**
 * @module TransactionViolation
 * @description Transaction Violation
 */

/**
 * Names of the various Transaction Violation types
 */
type ViolationName =
    | "perDayLimit"
    | "maxAge"
    | "overLimit"
    | "overLimitAttendee"
    | "overCategoryLimit"
    | "receiptRequired"
    | "missingCategory"
    | "categoryOutOfPolicy"
    | "missingTag"
    | "tagOutOfPolicy"
    | "missingComment"
    | "taxRequired"
    | "taxOutOfPolicy"
    | "billableExpense";


type ViolationType = string;

type TransactionViolation = {
    type: ViolationType;
    name: ViolationName;
    userMessage: string;
    data?: Record<string, string>
};

export type {
    TransactionViolation,
    ViolationName,
    ViolationType,
};
