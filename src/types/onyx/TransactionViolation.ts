// We need the runtime value of CONST here, because it's declared `as const` but the linter rule incorrectly identifies it as a type-only import.
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import type CONST from '@src/CONST';

/**
 * Names of violations.
 * Derived from `CONST.VIOLATIONS` to maintain a single source of truth.
 */
type ViolationName = (typeof CONST.VIOLATIONS)[keyof typeof CONST.VIOLATIONS];

type TransactionViolation = {
    type: string;
    name: ViolationName;
    userMessage: string;
    data?: {
        rejectedBy?: string;
        rejectReason?: string;
        amount?: string;
        surcharge?: number;
        invoiceMarkup?: number;
        maxAge?: number;
        tagName?: string;
        formattedLimitAmount?: string;
        categoryLimit?: string;
        limit?: string;
        category?: string;
        brokenBankConnection?: boolean;
        isAdmin?: boolean;
        email?: string;
        isTransactionOlderThan7Days?: boolean;
        member?: string;
        taxName?: string;
    };
};

export type {TransactionViolation, ViolationName};
