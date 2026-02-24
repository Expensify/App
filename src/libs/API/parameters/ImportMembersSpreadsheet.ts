type ImportMembersSpreadsheetParams = {
    policyID: string;
    /**
     * Stringified JSON object with type of following structure:
     * Array<{email: string, role: string}>
     */
    employees: string;
};

export default ImportMembersSpreadsheetParams;
