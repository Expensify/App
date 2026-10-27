/** Model of the Corpay pay modal signal sent by the backend when a pay attempt fails because the workspace USD VBBA is not set up on Corpay */
type CorpayPayModal = {
    /** The bank account ID of the workspace USD VBBA that needs global reimbursement enabled */
    bankAccountID: number;
    /** The country of the VBBA, sent so the client can render the business form without an extra BANK_ACCOUNT_LIST lookup */
    bankCountry: string;
    /** The currency of the VBBA, sent so the client can render the business form without an extra BANK_ACCOUNT_LIST lookup */
    bankCurrency: string;
};

export default CorpayPayModal;
