/**
 * The new lastPaymentMethod object
 */
type LastPaymentMethodType = {
    /** The default last payment method, this one hold the existing data of the old lastPaymentMethod value which is string */
    DEFAULT: string;
    /** The lastPaymentMethod of an IOU */
    IOU: string;
    /** The lastPaymentMethod of an Expense */
    EXPENSE: string;
    /** The lastPaymentMethod of an Invoice */
    INVOICE: string;
};

/** Record of last payment methods, indexed by policy id */
type LastPaymentMethod = Record<string, LastPaymentMethodType | string>;

export type {LastPaymentMethodType, LastPaymentMethod};
