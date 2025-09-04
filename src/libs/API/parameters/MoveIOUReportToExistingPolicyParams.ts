type MoveIOUReportToExistingPolicyParams = {
    iouReportID: string;
    policyID: string;
    changePolicyReportActionID: string;
    dmMovedReportActionID: string;
    optimisticReportID?: string;
};

export default MoveIOUReportToExistingPolicyParams;
