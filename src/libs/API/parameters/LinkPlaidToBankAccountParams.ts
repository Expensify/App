type LinkPlaidToBankAccountParams = {
    bankAccountID: number;
    plaidAccessToken: string;
    plaidAccountID: string;
    mask?: string;
    policyID?: string;
};
export default LinkPlaidToBankAccountParams;
