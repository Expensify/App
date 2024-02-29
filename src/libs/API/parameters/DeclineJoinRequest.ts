type DeclineJoinRequestParams = {
    requests: Array<{
        policyID: {
            accountID: string;
            adminsRoomMessageReportActionID: string;
        };
    }>;
};

export default DeclineJoinRequestParams;
