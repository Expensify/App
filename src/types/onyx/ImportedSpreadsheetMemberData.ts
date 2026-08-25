/** Model of imported spreadsheet member data */
type ImportedSpreadsheetMemberData = {
    email: string;

    role: string;

    /** The email of the member who approves this member's expenses */
    submitsTo: string;

    /** The email of the member to whom the expenses approved by this member are forwarded */
    forwardsTo: string;

    /** Custom field 1 value for this member */
    customField1?: string;

    /** Custom field 2 value for this member */
    customField2?: string;

    /** The approval limit amount for this member */
    approvalLimit?: string;

    /** The email of the user this member forwards reports to when over the approval limit */
    overLimitForwardsTo?: string;
};

export default ImportedSpreadsheetMemberData;
