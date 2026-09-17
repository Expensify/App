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

    promptKeyParams?: TranslationParameters<TPath>[0];

    /** Optional message appended after the prompt */
    pendingMessageKey?: SpreadsheetTranslationPaths;

    /**
     * Parameters for the appended message's translation. Kept separate from `promptKeyParams` so the
     * appended message can carry its own `count` and be pluralized independently of the prompt.
     *
     * Typed as a bare count rather than `TranslationParameters<SpreadsheetTranslationPaths>`: that
     * union spans every spreadsheet path, including plain-string ones whose parameters are `never[]`,
     * so it collapses to `undefined`. Distributing the union over both keys instead would square the
     * size of `ImportFinalModalUnion`.
     */
    pendingMessageKeyParams?: {
        /** Quantity the appended message pluralizes on */
        count: number;
    };
};

/**
 * Union type of all possible ImportFinalModal configurations
 * Each translation path gets its own properly typed variant
 */
type ImportFinalModalUnion = {
    [K in SpreadsheetTranslationPaths]: ImportFinalModal<K>;
}[SpreadsheetTranslationPaths];

/** Settings for importing transactions */
type ImportTransactionSettings = {
    cardDisplayName?: string;

    /** Currency for the imported transactions */
    currency?: string;

    /** Whether the transactions are reimbursable */
    isReimbursable?: boolean;

    flipAmountSign?: boolean;
};

/** Model of imported spreadsheet data */
type ImportedSpreadsheet = {
    data: string[][];

    /** Columns' names */
    columns: Record<number, string>;

    /** Whether the first row of the spreadsheet contains headers */
    containsHeader: boolean;

    isImportingMultiLevelTags: boolean;
    isImportingIndependentMultiLevelTags: boolean;

    /** Whether the GL code is in the adjacent column */
    isGLAdjacent: boolean;

    fileURI?: string;
    fileType?: string;
    fileName?: string;

    /** Settings for importing transactions from the spreadsheet */
    importTransactionSettings?: ImportTransactionSettings;

    /** ID for matching an async import result modal to the request that produced it */
    importFinalModalID?: string | null;

    /** Modal to show after a queued import request finishes */
    importFinalModal?: ImportFinalModalUnion | null;

    /** Whether the final member import modal should explain that restricted roles were replaced with the member role */
    shouldShowMemberRolePermissionWarning?: boolean;
};

export default ImportedSpreadsheet;
export type {ImportFinalModalUnion as ImportFinalModal, ImportTransactionSettings};
