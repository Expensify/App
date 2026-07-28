type DeleteAppReportParams = {
    reportID: string;
    transactionIDToReportActionAndThreadData?: string;
    selfDMReportID?: string;
    selfDMCreatedReportActionID?: string;
};

export default DeleteAppReportParams;
