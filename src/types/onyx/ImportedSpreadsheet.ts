import type {TranslationParameters, TranslationPaths} from '@src/languages/types';

/**
 * Filter translation paths that start with a specific prefix
 */
type PathsStartingWith<TPrefix extends string> = Extract<TranslationPaths, `${TPrefix}${string}`>;

/** Texts to display depending on request success/failure */
type ImportFinalModal<TPath extends PathsStartingWith<'spreadsheet'>> = {
    /** Title of the modal */
    title: PathsStartingWith<'spreadsheet'>;

    /** Message to display */
    prompt: TPath;

    /** Parameters for the translation */
    params: TranslationParameters<TPath>[0];
};

/**
 * Union type of all possible ImportFinalModal configurations
 * Each translation path gets its own properly typed variant
 */
type ImportFinalModalUnion = {
    [K in PathsStartingWith<'spreadsheet'>]: ImportFinalModal<K>;
}[PathsStartingWith<'spreadsheet'>];

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
