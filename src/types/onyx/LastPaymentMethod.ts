/**
 * PaymentInformation object
 */
type PaymentInformation = {
    /** The name of the  */
    name: string;
    /** The bank account id of the last payment method */
    bankAccountID?: number;
};

/**
 * The new lastPaymentMethod object
 */
type LastPaymentMethodType = {
    /** The default last payment method */
    lastUsed: PaymentInformation;
    /** The lastPaymentMethod of an IOU */
    iou: string;
    /** The lastPaymentMethod of an Expense */
    expense: string;
    /** The lastPaymentMethod of an Invoice */
    invoice: string | PaymentInformation;
};

/** Record of last payment methods, indexed by policy id */
type LastPaymentMethod = Record<string, LastPaymentMethodType | string>;

export type {LastPaymentMethodType, LastPaymentMethod, PaymentInformation};
