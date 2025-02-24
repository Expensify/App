/**
 * The new lastPaymentMethod object
 */
type LastPaymentMethodType = {
    /** The default last payment method */
    lastUsed: string;
    /** The lastPaymentMethod of an IOU */
    Iou: string;
    /** The lastPaymentMethod of an Expense */
    Expense: string;
    /** The lastPaymentMethod of an Invoice */
    Invoice: string;
};

/** Record of last payment methods, indexed by policy id */
type LastPaymentMethod = Record<string, LastPaymentMethodType | string>;

export type {LastPaymentMethodType, LastPaymentMethod};
