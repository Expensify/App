type VerifyIdentityForBankAccountParams = {
    bankAccountID: number;
    onfidoData: string;
    policyID: string;
    canUseNewVbbaFlow?: boolean;
};
export default VerifyIdentityForBankAccountParams;
