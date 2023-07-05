import BankAccount from './BankAccount';
import * as OnyxCommon from './OnyxCommon';

type PlaidData = OnyxCommon.BaseState & {
    /** Name of the bank */
    bankName?: string;

    /**
     * Access token returned by Plaid once the user has logged into their bank.
     * This token can be used along with internal credentials to query for Plaid Balance or Assets
     */
    plaidAccessToken?: string;

    /** List of plaid bank accounts */
    bankAccounts?: BankAccount[];
};

export default PlaidData;
