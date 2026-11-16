type ExportMembersSpreadsheetParams = {
    policyID: string;

    /** Whether each row lists the member's approvers in order, each with their approval limit, instead of the member's own submitsTo, approvesTo and approval limit */
    shouldIncludeApprovers: boolean;
};

export default ExportMembersSpreadsheetParams;
