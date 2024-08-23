type ImportTagsSpreadsheetParams = {
    policyID: string;
    /**
     * Stringified JSON object with type of following structure:
     * Array<{name: string, enabled: boolean, 'GL Code': string}>
     */
    tags: string;
};

export default ImportTagsSpreadsheetParams;
