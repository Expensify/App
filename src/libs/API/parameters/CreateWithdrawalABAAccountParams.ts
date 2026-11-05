type CreateWithdrawalABAAccountParams = {
    bsbNumber: string;
    accountNumber: string;

    /** The APCA user ID the bank gives the company for uploading ABA files */
    bankUserIdentificationNumber: string;
    companyName: string;

    /** Whether ABA files include a self-balancing debit row for this account, which some banks require */
    shouldIncludeSelfBalancingTransaction: boolean;

    /** The workspace that pays from this account */
    policyID: string;
};

export default CreateWithdrawalABAAccountParams;
