import CONST from '@src/CONST';
import AccountData from './AccountData';
import * as OnyxCommon from './OnyxCommon';

type AdditionalData = {
    isP2PDebitCard?: boolean;
    beneficialOwners?: string[];
    currency?: string;
    bankName?: string;
    fieldsType?: string;
    country?: string;
};

type BankAccount = {
    /** The bank account type */
    accountType?: typeof CONST.PAYMENT_METHODS.PERSONAL_BANK_ACCOUNT;

    /** string like 'Account ending in XXXX' */
    description?: string;

    isDefault?: boolean;

    /* Determines if the bank account is a savings account */
    isSavings?: boolean;

    /** Date when the 3 micro amounts for validation were supposed to reach the bank account. */
    validateCodeExpectedDate?: string;

    /** string like 'bankAccount-{<bankAccountID>}' where <bankAccountID> is the bankAccountID */
    key?: string;

    /** Alias for bankAccountID */
    methodID?: number;

    /** Alias for addressName */
    title?: string;

    /** All data related to the bank account */
    accountData?: AccountData;

    /** Any additional error message to show */
    errors?: OnyxCommon.Errors;

    /** Indicates the type of change made to the bank account that hasn't been synced with the server yet  */
    pendingAction?: OnyxCommon.PendingAction;
};

type BankAccountList = Record<string, BankAccount>;

export default BankAccount;
export type {AccountData, AdditionalData, BankAccountList};
