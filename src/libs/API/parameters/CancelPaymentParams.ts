type CancelPaymentParams = {
    iouReportID: string;
    /** A bill has no parent chat, so cancelPayment sends it only when the report has one */
    chatReportID?: string;
    managerAccountID: number;
    reportActionID: string;
};

export default CancelPaymentParams;
