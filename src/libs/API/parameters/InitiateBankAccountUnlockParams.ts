type InitiateBankAccountUnlockParams = {
    authToken: string | null | undefined;
    bankAccountID: number;
    // TODO Confirm message param
    // message: string;
};

export default InitiateBankAccountUnlockParams;
