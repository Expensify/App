type WalletTransferType = {
    /** Selected accountID for transfer */
    selectedAccountID: string | number;

    /** Type to filter the payment Method list */
    filterPaymentMethodType: 'debitCard' | 'bankAccount';

    /** Whether the success screen is shown to user. */
    shouldShowSuccess: boolean;
};

export default WalletTransferType;
