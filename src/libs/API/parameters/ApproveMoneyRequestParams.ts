type ApproveMoneyRequestParams = {
    reportID: string;
    approvedReportActionID: string;
    full?: boolean;
    optimisticHoldReportID?: string;
    optimisticHoldActionID?: string;
};

export default ApproveMoneyRequestParams;
