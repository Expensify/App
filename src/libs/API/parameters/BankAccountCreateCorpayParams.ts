type BankAccountCreateCorpayParams = {
    type: number;
    isSavings: boolean;
    isWithdrawal: boolean;
    inputs: string;
};

export default BankAccountCreateCorpayParams;
