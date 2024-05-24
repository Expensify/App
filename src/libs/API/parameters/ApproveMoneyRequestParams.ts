type ApproveMoneyRequestParams = {
    reportID: string;
    approvedReportActionID: string;
    full?: boolean;
    optimisticHoldReportID?: string;
};

export default ApproveMoneyRequestParams;
