/** Model of imported spreadsheet member data */
type ImportedSpreadsheetMemberData = {
    /** The email of the member */
    email: string;

    /** The role of the member */
    role: string;

    /** The email of the member who approves this member's expenses */
    submitsTo: string;

   /** The email of the member to whom the expenses approved by this member are forwarded *
    forwardsTo: string;
};

export default ImportedSpreadsheetMemberData;
