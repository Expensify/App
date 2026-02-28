import type CONST from '@src/CONST';
import type {FileObject} from '@src/types/utils/Attachment';
import type AccountData from './AccountData';
import type {BankName} from './Bank';
import type * as OnyxCommon from './OnyxCommon';

/** Model of additional bank account data */
type BankAccountAdditionalData = {
    /** Is a Peer-To-Peer Debit Card */
    isP2PDebitCard?: boolean;

    /** Owners that can benefit from this bank account */
    beneficialOwners?: string[];

    /** In which currency is the bank account */
    currency?: string;

    /** In which bank is the bank account */
    bankName?: BankName;

    /** Plaid account id */
    plaidAccountID?: string;

    /** Whether the bank account details were obtained for local transfer or international wire */
    fieldsType?: string;

    /** In which country is the bank account */
    country?: string;

    /** Is billing card */
    isBillingCard?: boolean;

    /** ID of related policy */
    policyID?: string;

    /** Corpay fields */
    corpay?: {
        /** Powerform files */
        achAuthorizationForm?: FileObject[];
    };
};

/** Model of bank account */
type BankAccount = OnyxCommon.OnyxValueWithOfflineFeedback<{
    /** The bank account type */
    accountType?: typeof CONST.PAYMENT_METHODS.PERSONAL_BANK_ACCOUNT;

    /** string like 'Account ending in XXXX' */
    description?: string;

    /** Determines if the bank account is a default payment method */
    isDefault?: boolean;

    /** Determines if the bank account is a savings account */
    isSavings?: boolean;

    /** Determines if the bank account is an Expensify Card settlement account */
    isExpensifyCardSettlementAccount?: boolean;

    /** Date when the 3 micro amounts for validation were supposed to reach the bank account */
    validateCodeExpectedDate?: string;

    /** string like `bankAccount-<bankAccountID>` */
    key?: string;

    /** Alias for bankAccountID */
    methodID?: number;

    /** Alias for addressName */
    title?: string;

    /** All data related to the bank account */
    accountData?: AccountData;

    /** Currency code related to the bank account */
    bankCurrency: string;

    /** Country code related to the bank account */
    bankCountry: string;

    /** Any additional error message to show */
    errors?: OnyxCommon.Errors;
}>;

/** Record of bank accounts, indexed by bankAccountID */
type BankAccountList = Record<string, BankAccount>;

export default BankAccount;
export type {BankAccountAdditionalData, BankAccountList};
