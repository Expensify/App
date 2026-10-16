/**
 * PaymentInformation object
 */
type PaymentInformation = {
    /** The name of the payment type used Elsewhere, Expensify, ACH, or a policyID. */
    name: string;
    bankAccountID?: number;
};

/**
 * The new lastPaymentMethod object
 */
type LastPaymentMethodType = {
    /** The default last payment method */
    lastUsed: PaymentInformation;
    iou: PaymentInformation;
    expense: PaymentInformation;
    invoice: string | PaymentInformation;
};

/** Record of last payment methods, indexed by policy id */
type LastPaymentMethod = Record<string, LastPaymentMethodType | string>;

export type {LastPaymentMethodType, LastPaymentMethod, PaymentInformation};
