/** Model of an approver listed for an imported member */
type ImportedSpreadsheetApprover = {
    email: string;

    /** The approver's approval limit, in cents. Unset when they have no limit */
    approvalLimit?: number;

    /** Who receives the reports at or over `approvalLimit`. Set exactly when `approvalLimit` is */
    overLimitForwardsTo?: string;
};

/** Model of imported spreadsheet member data */
type ImportedSpreadsheetMemberData = {
    email: string;
    role: string;

    /** The email of the member who approves this member's expenses. Unset when the member's approvers are imported as a list instead */
    submitsTo?: string;

    /** The email of the member to whom the expenses approved by this member are forwarded. Unset when the member's approvers are imported as a list instead */
    forwardsTo?: string;

    /** Custom field 1 value for this member */
    customField1?: string;

    /** Custom field 2 value for this member */
    customField2?: string;

    /** The approval limit amount for this member */
    approvalLimit?: string;

    /** The email of the user this member forwards reports to when over the approval limit */
    overLimitForwardsTo?: string;

    /** The approvers of this member's workflow, in order, which replace the ones they have. Unset when the spreadsheet lists none for them */
    approvers?: ImportedSpreadsheetApprover[];
};

export default ImportedSpreadsheetMemberData;
export type {ImportedSpreadsheetApprover};
