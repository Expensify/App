
import type CONST from '@src/CONST';
import type { ValueOf } from 'type-fest';


/**
 * PaymentInformation object
 */
type PaymentInformation = {
    /** The name of the  */
    name: ValueOf<typeof CONST.IOU.PAYMENT_TYPE>
    /** The bank account id of the last payment method */
    bankAccountID?: number;
}

/**
 * The new lastPaymentMethod object
 */
type LastPaymentMethodType = {
    /** The default last payment method */
    lastUsed: string | PaymentInformation;
    /** The lastPaymentMethod of an IOU */
    iou: string | PaymentInformation;
    /** The lastPaymentMethod of an Expense */
    expense: string | PaymentInformation;
    /** The lastPaymentMethod of an Invoice */
    invoice: string | PaymentInformation;
};

/** Record of last payment methods, indexed by policy id */
type LastPaymentMethod = Record<string, LastPaymentMethodType | string>;

export type {LastPaymentMethodType, LastPaymentMethod, PaymentInformation};
