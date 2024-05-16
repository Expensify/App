import type CONST from '@src/CONST';

/**
 * Names of violations.
 * Derived from `CONST.VIOLATIONS` to maintain a single source of truth.
 */
type ViolationName = (typeof CONST.VIOLATIONS)[keyof typeof CONST.VIOLATIONS];

type TransactionViolation = {
    type: string;
    name: ViolationName;
    data?: {
        rejectedBy?: string;
        rejectReason?: string;
        formattedLimit?: string;
        surcharge?: number;
        invoiceMarkup?: number;
        maxAge?: number;
        tagName?: string;
        categoryLimit?: string;
        limit?: string;
        category?: string;
        brokenBankConnection?: boolean;
        isAdmin?: boolean;
        email?: string;
        isTransactionOlderThan7Days?: boolean;
        member?: string;
        taxName?: string;
        tagListIndex?: number;
        tagListName?: string;
        errorIndexes?: number[];
    };
};

type TransactionViolations = TransactionViolation[];

export type {TransactionViolation, ViolationName};
export default TransactionViolations;
