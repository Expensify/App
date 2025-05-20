type DeleteAppReportParams = {
    reportID: string;
    transactionIDToMoneyRequestReportActionIDMap?: string;
    selfDMReportID?: string;
    selfDMCreatedReportActionID?: string;
};

export default DeleteAppReportParams;
