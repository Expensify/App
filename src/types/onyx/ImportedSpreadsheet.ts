import type {TranslationParameters, TranslationPaths} from '@src/languages/types';

/**
 * Filter translation paths that start with spreadsheet prefix
 */
type SpreadsheetTranslationPaths = Extract<TranslationPaths, `spreadsheet${string}`>;

/** Texts to display depending on request success/failure */
type ImportFinalModal<TPath extends SpreadsheetTranslationPaths> = {
    /** Title of the modal */
    titleKey: SpreadsheetTranslationPaths;

    /** Message to display */
    promptKey: TPath;

    /** Parameters for the translation */
    promptKeyParams: TranslationParameters<TPath>[0];
};

/**
 * Union type of all possible ImportFinalModal configurations
 * Each translation path gets its own properly typed variant
 */
type ImportFinalModalUnion = {
    [K in SpreadsheetTranslationPaths]: ImportFinalModal<K>;
}[SpreadsheetTranslationPaths];

/** Model of imported spreadsheet data */
type ImportedSpreadsheet = {
    /** Data of the imported spreadsheet */
    data: string[][];

    /** Columns' names */
    columns: Record<number, string>;

    /** Whether final modal should be opened */
    shouldFinalModalBeOpened: boolean;

    /** Texts to display depending on request success/failure */
    importFinalModal: ImportFinalModalUnion;

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
