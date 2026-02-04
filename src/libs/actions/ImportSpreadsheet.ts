import Onyx from 'react-native-onyx';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {ImportTransactionSettings} from '@src/types/onyx/ImportedSpreadsheet';

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
        // Reset modal state for new import
        shouldFinalModalBeOpened: false,
        importFinalModal: undefined,
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
        shouldFinalModalBeOpened: false,
        importFinalModal: null,
        // Clear the import settings so the next import starts fresh
        importTransactionSettings: null,
    });
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

export {setSpreadsheetData, setColumnName, closeImportPage, setContainsHeader, setImportTransactionCardName, setImportTransactionCurrency, setImportTransactionSettings};
