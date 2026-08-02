type LinkPlaidToBankAccountParams = {
    bankAccountID: number;
    publicToken: string;
    plaidAccountID: string;
    mask: string;
    policyID?: string;
};

export default LinkPlaidToBankAccountParams;
