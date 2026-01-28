type AssignCompanyCardParams = {
    domainAccountID?: number;
    policyID: string;
    bankName: string;
    cardName: string;
    encryptedCardNumber: string;
    email: string;
    startDate: string;
    reportActionID: string;
};

export default AssignCompanyCardParams;
