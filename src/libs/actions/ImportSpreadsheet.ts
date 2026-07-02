import Onyx from 'react-native-onyx';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {ImportFinalModal, ImportTransactionSettings} from '@src/types/onyx/ImportedSpreadsheet';
import type {SavedCSVColumnLayoutData} from '@src/types/onyx/SavedCSVColumnLayout';

type ImportFinalModalResult = {
    promise: Promise<ImportFinalModal>;
    cancel: () => void;
};

function setSpreadsheetData(
    data: string[][],
    fileURI: string,
    fileType: string,
    fileName: string,
    isImportingMultiLevelTags: boolean,
    importTransactionSettings?: ImportTransactionSettings,
): Promise<void | void[]> {
    // Validate that data is a non-empty array
    if (!Array.isArray(data) || data.length === 0) {
        return Promise.reject(new Error('Invalid data format: data is empty or not an array'));
    }

    // Validate that we have at least one row with data
    const firstRow = data.at(0);
    if (!Array.isArray(firstRow) || firstRow.length === 0) {
        return Promise.reject(new Error('Invalid data format: first row is empty or not an array'));
    }

    // Require at least 2 rows (header + data) for most imports
    if (data.length < 2) {
        return Promise.reject(new Error('Invalid data format: file must contain at least 2 rows'));
    }

    const numColumns = firstRow.length;

    // Transpose data from row-major to column-major format
    const transposedData: string[][] = firstRow.map((_, colIndex) => data.map((row) => String(row.at(colIndex) ?? '')));

    const columnNames: Record<number, string> = {};
    for (let colIndex = 0; colIndex < numColumns; colIndex++) {
        columnNames[colIndex] = CONST.CSV_IMPORT_COLUMNS.IGNORE;
    }

    // Use Onyx.set to replace the entire object (avoiding stale column data from previous files)
    // but include the preserved settings passed from the caller
    return Onyx.set(ONYXKEYS.IMPORTED_SPREADSHEET, {
        data: transposedData,
        columns: columnNames,
        fileURI,
        fileType,
        fileName,
        isImportingMultiLevelTags,
        // Preserve transaction import settings that were configured before file upload
        importTransactionSettings,
        containsHeader: true,
        isImportingIndependentMultiLevelTags: false,
        isGLAdjacent: false,
    });
}

function setColumnName(columnIndex: number, columnName: string): Promise<void> {
    return Onyx.merge(ONYXKEYS.IMPORTED_SPREADSHEET, {columns: {[columnIndex]: columnName}});
}

function setContainsHeader(containsHeader: boolean): Promise<void> {
    return Onyx.merge(ONYXKEYS.IMPORTED_SPREADSHEET, {containsHeader});
}

function closeImportPage(): Promise<void> {
    return Onyx.merge(ONYXKEYS.IMPORTED_SPREADSHEET, {
        data: null,
        columns: null,
        importFinalModalID: null,
        importFinalModal: null,
        // Clear the import settings so the next import starts fresh
        importTransactionSettings: null,
    });
}

function getImportFailedFinalModal(): ImportFinalModal {
    return {
        titleKey: 'spreadsheet.importFailedTitle',
        promptKey: 'spreadsheet.importFailedDescription',
    };
}

function getImportFinalModalID(): string {
    return `${Date.now()}-${Math.random()}`;
}

function getImportFinalModalOnyxData(importFinalModalID: string, importFinalModal: ImportFinalModal) {
    return {
        onyxMethod: Onyx.METHOD.MERGE,
        key: ONYXKEYS.IMPORTED_SPREADSHEET,
        value: {
            importFinalModalID,
            importFinalModal,
        },
    };
}

function waitForImportFinalModal(importFinalModalID: string): ImportFinalModalResult {
    let connection: ReturnType<typeof Onyx.connectWithoutView>;
    let isPending = true;

    const promise = new Promise<ImportFinalModal>((resolve) => {
        connection = Onyx.connectWithoutView({
            key: ONYXKEYS.IMPORTED_SPREADSHEET,
            callback: (spreadsheet) => {
                if (!isPending || spreadsheet?.importFinalModalID !== importFinalModalID || !spreadsheet?.importFinalModal) {
                    return;
                }

                isPending = false;
                Onyx.disconnect(connection);
                resolve(spreadsheet.importFinalModal);
            },
        });
    });

    return {
        promise,
        cancel: () => {
            if (!isPending) {
                return;
            }

            isPending = false;
            Onyx.disconnect(connection);
        },
    };
}

function setImportTransactionCardName(cardDisplayName: string): Promise<void> {
    return Onyx.merge(ONYXKEYS.IMPORTED_SPREADSHEET, {
        importTransactionSettings: {
            cardDisplayName,
        },
    });
}

function setImportTransactionCurrency(currency: string): Promise<void> {
    return Onyx.merge(ONYXKEYS.IMPORTED_SPREADSHEET, {
        importTransactionSettings: {
            currency,
        },
    });
}

function setImportTransactionSettings(cardDisplayName: string, currency: string, isReimbursable: boolean, flipAmountSign: boolean): Promise<void> {
    return Onyx.merge(ONYXKEYS.IMPORTED_SPREADSHEET, {
        importTransactionSettings: {
            cardDisplayName,
            currency,
            isReimbursable,
            flipAmountSign,
        },
    });
}

/**
 * Applies saved column mappings to the spreadsheet data if the column headers match.
 * This is used when importing transactions to an existing card that has a saved layout.
 *
 * @param spreadsheetData - The spreadsheet data in column-major format
 * @param savedLayout - The saved column layout for this card
 */
function applySavedColumnMappings(spreadsheetData: string[][], savedLayout: SavedCSVColumnLayoutData): void {
    const columnMapping = savedLayout?.columnMapping;
    if (!columnMapping?.names) {
        return;
    }
    const savedNames = columnMapping.names;

    const headerToIndex: Record<string, number> = {};
    for (const [index, column] of spreadsheetData.entries()) {
        const headerName = column.at(0)?.trim();
        if (headerName) {
            headerToIndex[headerName] = index;
        }
    }

    const columnUpdates: Record<number, string> = {};

    for (const role of CONST.CSV_IMPORT_COLUMNS.TRANSACTION_FIELDS) {
        const savedColumnName = savedNames[role];
        if (typeof savedColumnName !== 'string') {
            continue;
        }
        const trimmedName = savedColumnName.trim();
        if (trimmedName && headerToIndex[trimmedName] !== undefined) {
            columnUpdates[headerToIndex[trimmedName]] = role;
        }
    }

    if (Object.keys(columnUpdates).length > 0) {
        Onyx.merge(ONYXKEYS.IMPORTED_SPREADSHEET, {columns: columnUpdates});
    }
}

/**
 * Applies saved company card column mappings to the spreadsheet data.
 * Company card layouts (stored in the shared domain NVP) map a field role to a column index,
 * so mappings are re-applied by index. Roles that are not selectable in the current context
 * (e.g. advanced fields when advanced fields are disabled) are skipped so the header heuristics
 * can still fill those columns.
 *
 * @param spreadsheetData - The spreadsheet data in column-major format
 * @param savedColumnMappings - Saved mappings from uploadLayoutSettings, keyed by field role with a column index value
 * @param availableColumnRoles - The field roles currently selectable in the mapping UI
 */
function applyCompanyCardSavedColumnMappings(spreadsheetData: string[][], savedColumnMappings: Record<string, string>, availableColumnRoles: string[]): void {
    if (!savedColumnMappings) {
        return;
    }

    const validRoles = new Set(availableColumnRoles);
    const numColumns = spreadsheetData.length;
    const columnUpdates: Record<number, string> = {};

    for (const [role, indexValue] of Object.entries(savedColumnMappings)) {
        if (role === CONST.CSV_IMPORT_COLUMNS.IGNORE || !validRoles.has(role)) {
            continue;
        }
        const index = Number(indexValue);
        if (!Number.isInteger(index) || index < 0 || index >= numColumns) {
            continue;
        }
        columnUpdates[index] = role;
    }

    if (Object.keys(columnUpdates).length > 0) {
        Onyx.merge(ONYXKEYS.IMPORTED_SPREADSHEET, {columns: columnUpdates});
    }
}

export {
    setSpreadsheetData,
    setColumnName,
    closeImportPage,
    setContainsHeader,
    setImportTransactionCardName,
    setImportTransactionCurrency,
    setImportTransactionSettings,
    applySavedColumnMappings,
    applyCompanyCardSavedColumnMappings,
    getImportFailedFinalModal,
    getImportFinalModalID,
    getImportFinalModalOnyxData,
    waitForImportFinalModal,
};
