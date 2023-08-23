import PlaidBankAccount from './PlaidBankAccount';
import * as OnyxCommon from './OnyxCommon';

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

    isLoading?: boolean;
    errors: OnyxCommon.Errors;
};

export default PlaidData;
