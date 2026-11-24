/** Model of the enable global reimbursements modal signal, sent by the backend when a pay attempt fails because the workspace USD VBBA is not set up for global reimbursements, or set by the client when it detects that before paying */
type EnableGlobalReimbursementsModal = {
    /** The bank account ID of the workspace USD VBBA that needs global reimbursement enabled */
    bankAccountID: number;
    /** The country of the VBBA, sent so the client can render the business form without an extra BANK_ACCOUNT_LIST lookup */
    bankCountry: string;
    /** The currency of the VBBA, sent so the client can render the business form without an extra BANK_ACCOUNT_LIST lookup */
    bankCurrency: string;
    /** Whether bulk pay could not pay any of several selected reports, set only by the client so the intro explains it for all of them */
    isPayingMultipleReports?: boolean;
    /** The names of the reports bulk pay left unpaid while paying others, set only by the client so they are listed before the intro opens */
    unpaidReportNames?: string[];
    /** The masked number of the bank account, set with unpaidReportNames so the list can name the account */
    accountNumber?: string;
};

export default EnableGlobalReimbursementsModal;
