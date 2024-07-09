import type * as OnyxCommon from './OnyxCommon';
import type PlaidBankAccount from './PlaidBankAccount';

/** Model of plaid data */
type PlaidData = {
    /** Name of the bank */
    bankName?: string;

    /**
     * Access token returned by Plaid once the user has logged into their bank.
     * This token can be used along with internal credentials to query for Plaid Balance or Assets
     */
    plaidAccessToken: string;

    /** List of plaid bank accounts */
    bankAccounts?: PlaidBankAccount[];

    /** Whether the data is being fetched from server */
    isLoading?: boolean;

    /** Error messages to show in UI */
    errors: OnyxCommon.Errors;
};

export default PlaidData;
