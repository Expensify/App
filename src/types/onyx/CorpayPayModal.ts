/** Model of the Corpay pay modal signal sent by the backend when a pay attempt fails because the workspace USD VBBA is not set up on Corpay */
type CorpayPayModal = {
    /** The bank account ID of the workspace USD VBBA that needs global reimbursement enabled */
    bankAccountID: number;
};

export default CorpayPayModal;
