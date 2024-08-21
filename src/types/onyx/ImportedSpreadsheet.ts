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
};

export default ImportedSpreadsheet;
