import CONST from '../../CONST';

type WalletTransfer = {
    /** Selected accountID for transfer */
    selectedAccountID?: string;

    /** Selected accountType for transfer */
    selectedAccountType?: string;

    /** Type to filter the payment Method list */
    filterPaymentMethodType?: typeof CONST.PAYMENT_METHODS.DEBIT_CARD | typeof CONST.PAYMENT_METHODS.BANK_ACCOUNT;

    /** Whether the success screen is shown to user. */
    shouldShowSuccess?: boolean;

    /** An error message to display to the user */
    errors?: Record<string, string>;

    /** Whether or not data is loading */
    loading?: boolean;
};

export default WalletTransfer;
