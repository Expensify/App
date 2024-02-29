type AcceptJoinRequestParams = {
    requests: Array<{
        policyID: {
            accountID: string;
            adminsRoomMessageReportActionID: string;
        };
    }>;
};

export default AcceptJoinRequestParams;
