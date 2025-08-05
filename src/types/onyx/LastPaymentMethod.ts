/**
 * The new lastPaymentMethod object
 */
type LastPaymentMethodType = {
    /** The default last payment method */
    lastUsed: {
        /** The name of the last payment method */
        name: string;
    };
    /** The lastPaymentMethod of an IOU */
    Iou: {
        /** The name of the last payment method */
        name: string;
    };
    /** The lastPaymentMethod of an Expense */
    Expense: {
        /** The name of the last payment method */
        name: string;
    };
    /** The lastPaymentMethod of an Invoice */
    Invoice: {
        /** The name of the last payment method */
        name: string;
    };
};

/** Record of last payment methods, indexed by policy id */
type LastPaymentMethod = Record<string, LastPaymentMethodType | string>;

export type {LastPaymentMethodType, LastPaymentMethod};
