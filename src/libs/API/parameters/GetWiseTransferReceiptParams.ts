type GetWiseTransferReceiptParams = {
    /** The server finds the Wise transfer from the report's reimbursement, so its ID never reaches the client */
    reportID: string;
};

export default GetWiseTransferReceiptParams;
