import Onyx from 'react-native-onyx';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

function setSpreadsheetData(data: string[][]): Promise<void | void[]> {
    if (!Array.isArray(data) || !Array.isArray(data[0])) {
        return Promise.reject(new Error('Invalid data format'));
    }

    const transposedData = data[0].map((_, colIndex) => data.map((row) => row[colIndex]));
    const columnNames: Record<number, string> = data[0].reduce((acc: Record<number, string>, _, colIndex) => {
        acc[colIndex] = CONST.CSV_IMPORT_COLUMNS.IGNORE;
        return acc;
    }, {});

    return Onyx.merge(ONYXKEYS.IMPORTED_SPREADSHEET, {data: transposedData, columns: columnNames});
}

function setColumnName(columnIndex: number, columnName: string): Promise<void> {
    return Onyx.merge(ONYXKEYS.IMPORTED_SPREADSHEET, {columns: {[columnIndex]: columnName}});
}

function setContainsHeader(containsHeader: boolean): Promise<void> {
    return Onyx.merge(ONYXKEYS.IMPORTED_SPREADSHEET, {containsHeader});
}

function closeImportPage(): Promise<void> {
    return Onyx.merge(ONYXKEYS.IMPORTED_SPREADSHEET, {data: null, columns: null, shouldFinalModalBeOpened: false, importFinalModal: null});
}

export {setSpreadsheetData, setColumnName, closeImportPage, setContainsHeader};
