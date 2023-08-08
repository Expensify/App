import CONST from '../../CONST';
import * as OnyxCommon from './OnyxCommon';

type WalletTransfer = {
    /** Selected accountID for transfer */
    selectedAccountID?: string | number;

    /** Selected accountType for transfer */
    selectedAccountType?: string;

    /** Type to filter the payment Method list */
    // TODO: Remove this after CONST.ts is migrated to TS
    // eslint-disable-next-line @typescript-eslint/no-duplicate-type-constituents
    filterPaymentMethodType?: typeof CONST.PAYMENT_METHODS.DEBIT_CARD | typeof CONST.PAYMENT_METHODS.BANK_ACCOUNT;

    /** Whether the success screen is shown to user. */
    shouldShowSuccess?: boolean;

    /** An error message to display to the user */
    errors?: OnyxCommon.Errors;

    /** Whether or not data is loading */
    loading?: boolean;
};

export default WalletTransfer;
