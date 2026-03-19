type InitiateBankAccountUnlockParams = {
    authToken: string | null | undefined;
    bankAccountID: number;
    optimisticReportActionID: string | null | undefined;
};

export default InitiateBankAccountUnlockParams;
