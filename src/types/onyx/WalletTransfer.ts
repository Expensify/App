import type {ValueOf} from 'type-fest';
import type CONST from '@src/CONST';
import type * as OnyxCommon from './OnyxCommon';
import type PaymentMethod from './PaymentMethod';

/** Model of user wallet transfer */
type WalletTransfer = {
    /** Selected accountID for transfer */
    selectedAccountID?: string | number;

    /** Selected accountType for transfer */
    selectedAccountType?: string;

    /** Type to filter the payment Method list */
    filterPaymentMethodType?: FilterMethodPaymentType;

    /** Whether the success screen is shown to user. */
    shouldShowSuccess?: boolean;

    /** An error message to display to the user */
    errors?: OnyxCommon.Errors;

    /** Whether or not data is loading */
    loading?: boolean;

    /** Payment method used for transfer */
    paymentMethodType?: ValueOf<Pick<PaymentMethod, 'accountType'>>;
};

/** Available payment methods */
type FilterMethodPaymentType = typeof CONST.PAYMENT_METHODS.DEBIT_CARD | typeof CONST.PAYMENT_METHODS.PERSONAL_BANK_ACCOUNT | '';

export default WalletTransfer;

export type {FilterMethodPaymentType};
