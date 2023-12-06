import CONST from '@src/CONST';

/**
 * Names of Fields where violations can occur. Derived from `CONST.VIOLATIONS` to maintain a single source of truth.
 */
type ViolationName = (typeof CONST.VIOLATIONS)[keyof typeof CONST.VIOLATIONS];

type TransactionViolation = {
    type: string;
    name: ViolationName;
    userMessage: string;
    data?: Record<string, string>;
};

export type {TransactionViolation, ViolationName};
