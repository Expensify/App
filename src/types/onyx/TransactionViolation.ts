import type CONST from '@src/CONST';

/**
 * Names of violations.
 * Derived from `CONST.VIOLATIONS` to maintain a single source of truth.
 */
type ViolationName = (typeof CONST.VIOLATIONS)[keyof typeof CONST.VIOLATIONS];
type ViolationDataType = (typeof CONST.VIOLATION_DATA_TYPES)[keyof typeof CONST.VIOLATION_DATA_TYPES];

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
        pendingPattern?: boolean;
        type?: ViolationDataType;
    };
    displayPercentVariance?: number;
};

type TransactionViolations = TransactionViolation[];

export type {TransactionViolation, ViolationName, ViolationDataType};
export default TransactionViolations;
