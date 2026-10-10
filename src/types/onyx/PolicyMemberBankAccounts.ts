import type {BankName} from './Bank';

/** Default deposit bank account of each workspace member that has one, indexed by accountID. Only sent to workspace admins. */
type PolicyMemberBankAccounts = Record<
    string,
    {
        /** Name of the bank, used to pick its icon */
        bankName?: BankName;

        /** Last four digits of the account number */
        bankAccountLastFour?: string;
    }
>;

export default PolicyMemberBankAccounts;
