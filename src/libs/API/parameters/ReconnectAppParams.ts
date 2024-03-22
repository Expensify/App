type ReconnectAppParams = {
    mostRecentReportActionLastModified?: string;
    updateIDFrom?: number;
    policyIDList: string[];
    idempotencyKey?: string;
};

export default ReconnectAppParams;
