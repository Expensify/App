import CONST from '../../CONST';
import AccountData from './AccountData';

type BankAccount = {
    /** The bank account type */
    accountType?: typeof CONST.PAYMENT_METHODS.BANK_ACCOUNT;

    /** string like 'Account ending in XXXX' */
    description?: string;

    isDefault?: boolean;

    /** string like 'bankAccount-{<bankAccountID>}' where <bankAccountID> is the bankAccountID */
    key?: string;

    /** Alias for bankAccountID */
    methodID?: number;

    /** Alias for addressName */
    title?: string;

    /** All data related to the bank account */
    accountData?: AccountData;
};

export default BankAccount;
