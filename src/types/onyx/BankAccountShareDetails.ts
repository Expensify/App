/** Model of a report action draft */
type BankAccountShareDetails = {
    /** The bank address name */
    addressName: string;

    /** The user account name */
    accountName: string;

    /** The user's email */
    shareeEmail: string;

    /** Indicates if the share is complete */
    shareComplete: boolean;

    /** The bank account ID */
    bankAccountID: number;

    /** The bank account routing number */
    routingNumber: string;

    /** Bank account number */
    accountNumber: string;

    /** Indicates if the bank supports debit */
    allowDebit: boolean;

    /** The bank processor */
    processor: string;

    /** Indicates if the bank account is being validated */
    validating: boolean;
};

export default BankAccountShareDetails;
