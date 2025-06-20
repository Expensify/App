/** Model of imported spreadsheet data */
type ImportedSpreadsheet = {
    /** Data of the imported spreadsheet */
    data: string[][];

    /** Columns' names */
    columns: Record<number, string>;

    /** Whether final modal should be opened */
    shouldFinalModalBeOpened: boolean;

    /** Texts to display depending on request success/failure */
    importFinalModal: {
        /** Title of the modal */
        title: string;

        /** Message to display */
        prompt: string;
    };

    /** Whether the first row of the spreadsheet contains headers */
    containsHeader: boolean;

    /** Whether the spreadsheet is importing multi-level tags */
    isImportingMultiLevelTags: boolean;

    /** Whether the spreadsheet is importing independent multi-level tags */
    isImportingIndependentMultiLevelTags: boolean;

    /** Whether the GL code is in the adjacent column */
    isGLAdjacent: boolean;

    /** The imported file URI */
    fileURI?: string;

    /** The file type of the imported file */
    fileType?: string;

    /** The file name of the imported file */
    fileName?: string;
};

export default ImportedSpreadsheet;
